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
    public function downloadTemplate($id, Request $request)
    {
        $category = LetterCategory::findOrFail($id);
        $type = $request->query('type', 'pengantar');

        $filePath = null;
        if ($type === 'permohonan') {
            if ($category->file_template_permohonan_path && Storage::disk('public')->exists($category->file_template_permohonan_path)) {
                $filePath = $category->file_template_permohonan_path;
            } elseif ($category->file_template_path && Storage::disk('public')->exists($category->file_template_path)) {
                $filePath = $category->file_template_path;
            }
        } else {
            if ($category->file_template_pengantar_path && Storage::disk('public')->exists($category->file_template_pengantar_path)) {
                $filePath = $category->file_template_pengantar_path;
            } elseif ($category->file_template_path && Storage::disk('public')->exists($category->file_template_path)) {
                $filePath = $category->file_template_path;
            }
        }

        if (!$filePath) {
            return response()->json([
                'status' => 'error',
                'message' => 'File template tidak ditemukan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($filePath);
        $suffix = $type === 'permohonan' ? 'Permohonan' : 'Pengantar';
        $downloadName = 'Template_' . str_replace(' ', '_', $category->nama_kategori) . '_' . $suffix . '.docx';

        return response()->download($fullPath, $downloadName);
    }

    /**
     * Download generated/uploaded final letter document (Surat Pengantar)
     */
    public function downloadResult($id)
    {
        $letterRequest = LetterRequest::with('category')->findOrFail($id);

        $generated = \App\Services\DocumentGeneratorService::generatePengantar($letterRequest);
        $filePath = $generated ?: $letterRequest->file_hasil_path;

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen pengantar belum tersedia atau file tidak ditemukan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($filePath);
        $categoryName = $letterRequest->category ? $letterRequest->category->nama_kategori : 'Surat';
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $downloadName = str_replace(' ', '_', $categoryName) . '_Pengantar_' . $letterRequest->id . '.' . $ext;

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

        $generated = \App\Services\DocumentGeneratorService::generatePermohonan($letterRequest);
        $filePath = $generated ?: $letterRequest->file_permohonan_path;

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Surat permohonan belum tersedia atau file tidak ditemukan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($filePath);
        $categoryName = $letterRequest->category ? $letterRequest->category->nama_kategori : 'Surat';
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $downloadName = str_replace(' ', '_', $categoryName) . '_Permohonan_' . $letterRequest->id . '.' . $ext;

        return response()->download($fullPath, $downloadName);
    }
}
