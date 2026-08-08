<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LetterRequest;
use App\Services\DocumentGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Exception;

class RequestController extends Controller
{
    /**
     * Get all letter requests with complete eager loading
     */
    public function index()
    {
        $requests = LetterRequest::with([
            'mahasiswa.user',
            'category',
            'values.variable',
            'requestRequirements.requirement',
        ])->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests,
        ]);
    }

    /**
     * Update Letter Request Status
     * When status === 'selesai', if admin uploads a file, it will be saved;
     * otherwise, it automatically generates the letter from category template.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diajukan,diterima,diproses,ditolak,selesai',
            'file_surat' => 'nullable|file|mimes:docx,doc,pdf|max:20480',
            'alasan_penolakan' => 'nullable|string|max:1000',
        ]);

        $letterRequest = LetterRequest::with([
            'mahasiswa',
            'category',
            'values.variable',
        ])->findOrFail($id);

        if ($request->has('alasan_penolakan')) {
            $letterRequest->alasan_penolakan = $request->alasan_penolakan;
        }

        if ($request->status === 'selesai') {
            $filePath = $letterRequest->file_hasil_path;

            if ($request->hasFile('file_surat')) {
                // Delete old file if exists
                if ($letterRequest->file_hasil_path && Storage::disk('public')->exists($letterRequest->file_hasil_path)) {
                    Storage::disk('public')->delete($letterRequest->file_hasil_path);
                }
                $file = $request->file('file_surat');
                $filename = time() . '_surat_' . $letterRequest->id . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('generated_letters', $filename, 'public');
            } else {
                // Delete old generated file if exists
                if ($letterRequest->file_hasil_path && Storage::disk('public')->exists($letterRequest->file_hasil_path)) {
                    Storage::disk('public')->delete($letterRequest->file_hasil_path);
                }
                // Auto generate fresh document from template
                $generated = DocumentGeneratorService::generate($letterRequest);
                if ($generated) {
                    $filePath = $generated;
                }
            }

            $letterRequest->status = 'selesai';
            $letterRequest->file_hasil_path = $filePath;
            $letterRequest->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Status pengajuan berhasil diperbarui menjadi selesai.',
                'data' => [
                    'request' => $letterRequest->fresh(['mahasiswa', 'category', 'values.variable', 'requestRequirements.requirement']),
                    'file_hasil_path' => $filePath,
                ],
            ]);
        }

        $letterRequest->status = $request->status;
        $letterRequest->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status pengajuan berhasil diperbarui.',
            'data' => [
                'request' => $letterRequest->fresh(['mahasiswa', 'category', 'values.variable', 'requestRequirements.requirement']),
                'file_hasil_path' => $letterRequest->file_hasil_path,
            ],
        ]);
    }
}
