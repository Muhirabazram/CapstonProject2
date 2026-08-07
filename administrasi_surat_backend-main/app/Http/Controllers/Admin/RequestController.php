<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LetterRequest;
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
     * When status === 'selesai', admin must upload the final letter file.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diajukan,diterima,diproses,ditolak,selesai',
            'file_surat' => 'required_if:status,selesai|file|mimes:docx,doc,pdf|max:20480',
        ]);

        $letterRequest = LetterRequest::with([
            'mahasiswa',
            'category',
            'values.variable',
        ])->findOrFail($id);

        if ($request->status === 'selesai') {
            $filePath = null;
            if ($request->hasFile('file_surat')) {
                $file = $request->file('file_surat');
                $filename = time() . '_surat_' . $letterRequest->id . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('generated_letters', $filename, 'public');
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
