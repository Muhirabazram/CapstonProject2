<?php

namespace App\Services;

use App\Models\LetterRequest;
use App\Models\LetterCategory;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class DocumentGeneratorService
{
    /**
     * Generate filled .docx letter for Permohonan or Pengantar
     */
    public static function generatePermohonan(LetterRequest $letterRequest): ?string
    {
        $letterRequest->loadMissing(['category']);
        $category = $letterRequest->category;
        $templatePath = $category?->file_template_permohonan_path ?: $category?->file_template_path;
        
        $generatedPath = self::processTemplate($letterRequest, $templatePath, 'permohonan', true);
        if ($generatedPath) {
            $letterRequest->file_permohonan_path = $generatedPath;
            $letterRequest->save();
        }
        return $generatedPath;
    }

    public static function generatePengantar(LetterRequest $letterRequest): ?string
    {
        $letterRequest->loadMissing(['category']);
        $category = $letterRequest->category;
        $templatePath = $category?->file_template_pengantar_path ?: $category?->file_template_path;

        $generatedPath = self::processTemplate($letterRequest, $templatePath, 'pengantar', false);
        if ($generatedPath) {
            $letterRequest->file_hasil_path = $generatedPath;
            $letterRequest->save();
        }
        return $generatedPath;
    }

    /**
     * Legacy alias for generate
     */
    public static function generate(LetterRequest $letterRequest): ?string
    {
        return self::generatePengantar($letterRequest);
    }

    /**
     * Generate nomor surat for pengantar
     * Format: {nomor_urut}/STMIK-BDG/{prodi_wk3}/E/{bulan_romawi}/{tahun}
     * 
     * @param LetterRequest $letterRequest
     * @return string Generated nomor surat
     */
    public static function generateNomorSurat(LetterRequest $letterRequest): string
    {
        $letterRequest->loadMissing(['category']);
        $category = $letterRequest->category;

        // Get prodi_wk3 based on category group (Akademik -> PRODI, Kemahasiswaan -> WK-3)
        $prodiWk3 = self::getProdiWk3($category);

        // Get current month in Roman numerals & current year
        $now = Carbon::now();
        $bulanRomawi = self::getBulanRomawi($now->month);
        $tahun = $now->year;

        // Get next sequence number (+1 per ACC/selesai request)
        $nomorUrut = self::getNextNomorUrut($category);

        // Format: 0042/STMIK-BDG/WK-3/E/VIII/2026
        return sprintf('%04d/STMIK-BDG/%s/E/%s/%d', $nomorUrut, $prodiWk3, $bulanRomawi, $tahun);
    }

    /**
     * Get prodi_wk3 based on category group
     * Akademik -> PRODI, Kemahasiswaan -> WK-3
     */
    private static function getProdiWk3(?LetterCategory $category): string
    {
        if (!$category) {
            return 'PRODI';
        }

        $grupKategori = strtolower(trim($category->grup_kategori ?? ''));

        if ($grupKategori === 'kemahasiswaan') {
            return 'WK-3';
        }

        return 'PRODI';
    }

    /**
     * Convert month number to Roman numerals
     */
    private static function getBulanRomawi(int $month): string
    {
        $romanNumerals = [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
            11 => 'XI',
            12 => 'XII',
        ];

        return $romanNumerals[$month] ?? (string) $month;
    }

    /**
     * Get next sequence number for letter requests with status 'selesai'
     */
    private static function getNextNomorUrut(?LetterCategory $category = null): int
    {
        $now = Carbon::now();

        // Count all completed letter requests in current year (+1 for next)
        $count = LetterRequest::where('status', 'selesai')
            ->whereYear('updated_at', $now->year)
            ->count();

        return $count + 1;
    }

    /**
     * Helper to process docx template processor
     */
    private static function processTemplate(LetterRequest $letterRequest, ?string $templateRelativePath, string $prefix = 'surat', bool $includeSignature = true): ?string
    {
        if (!$templateRelativePath) {
            return null;
        }

        $letterRequest->loadMissing([
            'category',
            'mahasiswa',
            'values.variable',
        ]);

        $disk = Storage::disk('public');
        if (!$disk->exists($templateRelativePath)) {
            return null;
        }

        $templateFullPath = $disk->path($templateRelativePath);

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

            // Letter numbering variables
            $grupKategori = strtolower(trim($letterRequest->category?->grup_kategori ?? ''));
            $prodiWk3 = ($grupKategori === 'kemahasiswaan') ? 'WK-3' : 'PRODI';
            $now = Carbon::now();
            $bulanRomawi = self::getBulanRomawi($now->month);
            $tahun = $now->year;

            $dataMap['prodi_wk3'] = $prodiWk3;
            $dataMap['bulan_romawi'] = $bulanRomawi;
            $dataMap['tahun'] = (string)$tahun;

            if ($prefix === 'pengantar' && ($letterRequest->status === 'selesai' || !empty($letterRequest->nomor_surat))) {
                if (empty($letterRequest->nomor_surat)) {
                    $letterRequest->nomor_surat = self::generateNomorSurat($letterRequest);
                    $letterRequest->save();
                }

                $seqStr = '0001';
                if (preg_match('/^(\d+)/', $letterRequest->nomor_surat, $matches)) {
                    $seqStr = sprintf('%04d', (int)$matches[1]);
                }

                $dataMap['nomor_surat'] = $seqStr;
                $dataMap['nomor_urut'] = $seqStr;
                $dataMap['nomor'] = $seqStr;
                $dataMap['nomor_lengkap'] = $letterRequest->nomor_surat;
                $dataMap['nomor_full'] = $letterRequest->nomor_surat;
            }

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
                    // Inject signature image if available and enabled for this letter type (Surat Permohonan)
                    $sigRelPath = $includeSignature ? $letterRequest->file_ttd_digital_path : null;
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
                        $templateProcessor->setValue($varName, '');
                    }
                }
            }

            // Ensure destination folder exists
            if (!$disk->exists('generated_letters')) {
                $disk->makeDirectory('generated_letters');
            }

            $outputFilename = $prefix . '_' . $letterRequest->id . '_' . time() . '.docx';
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
