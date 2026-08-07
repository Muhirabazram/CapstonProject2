<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LetterRequest;
use App\Models\LetterRequestValue;
use App\Models\LetterRequestRequirement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RequestController extends Controller
{
    /**
     * Submit new letter request (Form values & Requirement file uploads)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $mahasiswa = $user->mahasiswa;

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil mahasiswa tidak ditemukan untuk akun ini.',
            ], 403);
        }

        $request->validate([
            'category_id' => 'required|exists:letter_categories,id',
            'values' => 'nullable|array',
            'values.*.variable_id' => 'required|exists:letter_variables,id',
            'values.*.nilai_isian' => 'required|string',
            'requirements' => 'nullable|array',
            'requirements.*.requirement_id' => 'required|exists:letter_requirements,id',
            'requirements.*.file' => 'required|file|max:10240',
        ]);

        return DB::transaction(function () use ($request, $mahasiswa) {
            $letterRequest = LetterRequest::create([
                'mahasiswa_id' => $mahasiswa->id,
                'category_id' => $request->category_id,
                'status' => 'diajukan',
                'tanggal_pengajuan' => now()->toDateString(),
            ]);

            if ($request->has('values')) {
                foreach ($request->values as $val) {
                    LetterRequestValue::create([
                        'request_id' => $letterRequest->id,
                        'variable_id' => $val['variable_id'],
                        'nilai_isian' => $val['nilai_isian'],
                    ]);
                }
            }

            $reqFiles = $request->file('requirements');
            if ($reqFiles) {
                foreach ($reqFiles as $idx => $reqItem) {
                    $reqId = $request->requirements[$idx]['requirement_id'] ?? null;
                    $file = $reqItem['file'] ?? null;
                    if ($reqId && $file && $file->isValid()) {
                        $filename = time() . '_req_' . $reqId . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('requirements_uploads', $filename, 'public');

                        LetterRequestRequirement::create([
                            'request_id' => $letterRequest->id,
                            'requirement_id' => $reqId,
                            'file_path' => $filePath,
                        ]);
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Pengajuan surat berhasil dikirim.',
                'data' => $letterRequest->load(['category', 'values.variable', 'requestRequirements.requirement']),
            ], 201);
        });
    }

    /**
     * View history of letter requests for logged in student
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $mahasiswa = $user->mahasiswa;

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil mahasiswa tidak ditemukan.',
            ], 403);
        }

        $requests = LetterRequest::with([
            'category',
            'values.variable',
            'requestRequirements.requirement',
        ])
        ->where('mahasiswa_id', $mahasiswa->id)
        ->latest()
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests,
        ]);
    }
}
