<?php

namespace App\Services;

use App\Models\LetterRequest;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Exception;

class DocumentGeneratorService
{
    /**
     * Generate filled .docx letter dynamically based on category template file
     *
     * @param LetterRequest $letterRequest
     * @return string|null Relative storage path of generated file, or null if template not found
     */
    public static function generate(LetterRequest $letterRequest): ?string
    {
        $letterRequest->loadMissing([
            'category',
            'mahasiswa',
            'values.variable',
        ]);

        $category = $letterRequest->category;
        if (!$category || !$category->file_template_path) {
            return null;
        }

        $disk = Storage::disk('public');
        if (!$disk->exists($category->file_template_path)) {
            return null;
        }

        $templateFullPath = $disk->path($category->file_template_path);

        try {
            $templateProcessor = new TemplateProcessor($templateFullPath);
            $templateVars = $templateProcessor->getVariables();

            $mahasiswa = $letterRequest->mahasiswa;
            $formattedDate = Carbon::parse($letterRequest->tanggal_pengajuan ?? now())
                ->locale('id')
                ->isoFormat('D MMMM Y');

            // Data dictionary for text replacement
            $dataMap = [];

            // Add student profile data
            if ($mahasiswa) {
                $studentName = $mahasiswa->nama ?? $mahasiswa->nama_lengkap ?? $mahasiswa->user?->name ?? '';
                $dataMap['nama'] = $studentName;
                $dataMap['nama_lengkap'] = $studentName;
                $dataMap['nim'] = $mahasiswa->nim;
                $dataMap['prodi'] = $mahasiswa->prodi;
                $dataMap['program_studi'] = $mahasiswa->prodi;

                // Contact & Additional Profile Information
                $noHp = $mahasiswa->no_hp ?? '';
                $dataMap['no_hp'] = $noHp;
                $dataMap['nohp'] = $noHp;
                $dataMap['no_telepon'] = $noHp;
                $dataMap['telepon'] = $noHp;
                $dataMap['phone'] = $noHp;
                $dataMap['hp'] = $noHp;

                $email = $mahasiswa->email ?? '';
                $dataMap['email'] = $email;
                $dataMap['e_mail'] = $email;

                $dataMap['alamat'] = $mahasiswa->alamat ?? '';
                $dataMap['angkatan'] = $mahasiswa->angkatan ?? '';
                $dataMap['jenis_kelamin'] = $mahasiswa->jenis_kelamin ?? '';
                $dataMap['jk'] = $mahasiswa->jenis_kelamin ?? '';
                $dataMap['jenis_mahasiswa'] = $mahasiswa->jenis_mahasiswa ?? '';
                $dataMap['tempat_lahir'] = $mahasiswa->tempat_lahir ?? '';
                $dataMap['tanggal_lahir'] = $mahasiswa->tanggal_lahir ? Carbon::parse($mahasiswa->tanggal_lahir)->locale('id')->isoFormat('D MMMM Y') : '';
                $dataMap['dosen_wali'] = $mahasiswa->dosen_wali ?? '';
                $dataMap['status_mahasiswa'] = $mahasiswa->status_mahasiswa ?? '';
            }
            $dataMap['tanggal'] = $formattedDate;
            $dataMap['tanggal_pengajuan'] = $formattedDate;

            // Add dynamic form values
            if ($letterRequest->values) {
                foreach ($letterRequest->values as $val) {
                    if ($val->variable && $val->variable->nama_variabel) {
                        $key = $val->variable->nama_variabel;
                        $dataMap[$key] = $val->nilai_isian ?? '';
                    }
                }
            }

            // Create case-insensitive lookup table
            $lowerMap = [];
            foreach ($dataMap as $k => $v) {
                $lowerMap[strtolower(trim($k))] = $v;
            }

            // Signature placeholders list
            $sigKeys = ['ttd_digital', 'ttd', 'ttd_mahasiswa', 'tanda_tangan'];

            // Replace each variable in docx template
            foreach ($templateVars as $varName) {
                $varLower = strtolower(trim($varName));

                if (in_array($varLower, $sigKeys, true)) {
                    // Inject signature image if available
                    $sigRelPath = $letterRequest->file_ttd_digital_path;
                    $sigFullPath = null;

                    if ($sigRelPath) {
                        if ($disk->exists($sigRelPath)) {
                            $sigFullPath = $disk->path($sigRelPath);
                        } elseif (file_exists(storage_path('app/public/' . $sigRelPath))) {
                            $sigFullPath = storage_path('app/public/' . $sigRelPath);
                        } elseif (file_exists($sigRelPath)) {
                            $sigFullPath = $sigRelPath;
                        }
                    }

                    if ($sigFullPath && file_exists($sigFullPath)) {
                        $templateProcessor->setImageValue($varName, [
                            'path' => $sigFullPath,
                            'width' => 120,
                            'height' => 80,
                            'ratio' => true,
                        ]);
                    } else {
                        $templateProcessor->setValue($varName, '');
                    }
                } else {
                    // Replace text variable
                    if (array_key_exists($varLower, $lowerMap)) {
                        $templateProcessor->setValue($varName, (string)$lowerMap[$varLower]);
                    } else {
                        // Leave empty or keep placeholder if no value provided
                        $templateProcessor->setValue($varName, '');
                    }
                }
            }

            // Ensure destination folder exists
            if (!$disk->exists('generated_letters')) {
                $disk->makeDirectory('generated_letters');
            }

            $outputFilename = 'surat_' . $letterRequest->id . '_' . time() . '.docx';
            $relativeOutputPath = 'generated_letters/' . $outputFilename;
            $fullOutputPath = $disk->path($relativeOutputPath);

            $templateProcessor->saveAs($fullOutputPath);

            return $relativeOutputPath;
        } catch (Exception $e) {
            logger()->error('DocumentGeneratorService Error: ' . $e->getMessage());
            return null;
        }
    }
}
