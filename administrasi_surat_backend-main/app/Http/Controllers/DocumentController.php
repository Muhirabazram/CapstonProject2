<?php

namespace App\Http\Controllers;

use App\Models\LetterCategory;
use App\Models\LetterRequest;
use App\Models\LetterRequestRequirement;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * Download blank category template .docx file
     */
    public function downloadTemplate($id)
    {
        $category = LetterCategory::findOrFail($id);

        if (!$category->file_template_path || !Storage::disk('public')->exists($category->file_template_path)) {
            return response()->json([
                'status' => 'error',
                'message' => 'File template tidak ditemukan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($category->file_template_path);
        $downloadName = 'Template_' . str_replace(' ', '_', $category->nama_kategori) . '.docx';

        return response()->download($fullPath, $downloadName);
    }

    /**
     * Download generated/uploaded final letter document
     */
    public function downloadResult($id)
    {
        $letterRequest = LetterRequest::with('category')->findOrFail($id);

        if (!$letterRequest->file_hasil_path || !Storage::disk('public')->exists($letterRequest->file_hasil_path)) {
            $generated = \App\Services\DocumentGeneratorService::generate($letterRequest);
            if ($generated) {
                $letterRequest->file_hasil_path = $generated;
                $letterRequest->save();
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dokumen hasil belum tersedia atau file tidak ditemukan.',
                ], 404);
            }
        }

        $fullPath = Storage::disk('public')->path($letterRequest->file_hasil_path);
        $categoryName = $letterRequest->category ? $letterRequest->category->nama_kategori : 'Surat';
        $ext = pathinfo($letterRequest->file_hasil_path, PATHINFO_EXTENSION);
        $downloadName = str_replace(' ', '_', $categoryName) . '_Selesai_' . $letterRequest->id . '.' . $ext;

        return response()->download($fullPath, $downloadName);
    }

    /**
     * Download a prerequisite document uploaded by student
     */
    public function downloadRequirement($id)
    {
        $rr = LetterRequestRequirement::with('requirement')->findOrFail($id);

        if (!$rr->file_path || !Storage::disk('public')->exists($rr->file_path)) {
            return response()->json([
                'status' => 'error',
                'message' => 'File dokumen prasyarat tidak ditemukan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($rr->file_path);
        $originalName = basename($rr->file_path);
        $reqName = $rr->requirement ? str_replace(' ', '_', $rr->requirement->nama_syarat) : 'Dokumen';

        return response()->download($fullPath, $reqName . '_' . $originalName);
    }

    /**
     * Download generated Surat Permohonan document
     */
    public function downloadPermohonan($id)
    {
        $letterRequest = LetterRequest::with('category')->findOrFail($id);

        if (!$letterRequest->file_permohonan_path || !Storage::disk('public')->exists($letterRequest->file_permohonan_path)) {
            $generated = \App\Services\DocumentGeneratorService::generatePermohonan($letterRequest);
            if ($generated) {
                $letterRequest->file_permohonan_path = $generated;
                $letterRequest->save();
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Surat permohonan belum tersedia atau file tidak ditemukan.',
                ], 404);
            }
        }

        $fullPath = Storage::disk('public')->path($letterRequest->file_permohonan_path);
        $categoryName = $letterRequest->category ? $letterRequest->category->nama_kategori : 'Surat';
        $ext = pathinfo($letterRequest->file_permohonan_path, PATHINFO_EXTENSION);
        $downloadName = str_replace(' ', '_', $categoryName) . '_Permohonan_' . $letterRequest->id . '.' . $ext;

        return response()->download($fullPath, $downloadName);
    }
}
