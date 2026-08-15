<?php

namespace App\Services;

use App\Models\LetterRequest;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;
use Exception;

class WordGeneratorService
{
    /**
     * Generate Word Document based on Template and LetterRequest values.
     *
     * @param LetterRequest $letterRequest
     * @return string Relative path of generated Word document
     * @throws Exception
     */
    public function generate(LetterRequest $letterRequest): string
    {
        $letterRequest->loadMissing(['mahasiswa', 'category', 'values.variable']);

        $category = $letterRequest->category;
        if (!$category) {
            throw new Exception("Kategori surat tidak ditemukan.");
        }

        if (!$category->file_template_path) {
            throw new Exception("Template Word belum diupload untuk kategori '{$category->nama_kategori}'. Admin harus mengupload template .docx terlebih dahulu.");
        }

        // Get full template path
        $templatePath = Storage::disk('public')->path($category->file_template_path);
        if (!file_exists($templatePath)) {
            $templatePath = storage_path('app/public/' . ltrim($category->file_template_path, '/'));
        }

        if (!file_exists($templatePath)) {
            throw new Exception("File template tidak ditemukan di storage: {$category->file_template_path}. Silakan upload ulang template.");
        }

        $templateProcessor = new TemplateProcessor($templatePath);

        // Inject Student Profile Information
        $mahasiswa = $letterRequest->mahasiswa;
        if ($mahasiswa) {
            $templateProcessor->setValue('nama', $mahasiswa->nama ?? '');
            $templateProcessor->setValue('nim', $mahasiswa->nim ?? '');
            $templateProcessor->setValue('prodi', $mahasiswa->prodi ?? '');
        }

        // Inject Request Date
        $templateProcessor->setValue('tanggal_pengajuan', $letterRequest->tanggal_pengajuan ? date('d-m-Y', strtotime($letterRequest->tanggal_pengajuan)) : date('d-m-Y'));
        $templateProcessor->setValue('status', ucfirst($letterRequest->status));

        // Inject Form Variable Values
        foreach ($letterRequest->values as $val) {
            if ($val->variable) {
                $varName = $val->variable->nama_variabel;
                $varValue = $val->nilai_isian ?? '';
                $templateProcessor->setValue($varName, $varValue);
            }
        }

        // Prepare Output Directory & File Name
        $outputDir = storage_path('app/public/generated_letters');
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $fileName = 'Surat_' . $letterRequest->id . '_' . ($mahasiswa->nim ?? 'mhs') . '_' . time() . '.docx';
        $outputPath = $outputDir . '/' . $fileName;

        // Save Word File
        $templateProcessor->saveAs($outputPath);

        $relativeResultPath = 'generated_letters/' . $fileName;

        // Update DB Record
        $letterRequest->update([
            'file_hasil_path' => $relativeResultPath,
        ]);

        return $relativeResultPath;
    }
}
