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
            'file_ttd_digital' => 'nullable|file|mimes:png,jpg,jpeg|max:5120',
            'reapply_req_id' => 'nullable|exists:letter_requests,id',
            'values' => 'nullable|array',
            'values.*.variable_id' => 'required|exists:letter_variables,id',
            'values.*.nilai_isian' => 'required|string',
            'requirements' => 'nullable|array',
            'requirements.*.requirement_id' => 'required|exists:letter_requirements,id',
            'requirements.*.file' => 'nullable|file|max:10240',
        ]);

        return DB::transaction(function () use ($request, $mahasiswa) {
            $sigPath = null;
            $oldReq = $request->reapply_req_id ? LetterRequest::find($request->reapply_req_id) : null;

            if ($request->hasFile('file_ttd_digital')) {
                $sigFile = $request->file('file_ttd_digital');
                $filename = time() . '_ttd_' . $mahasiswa->id . '.' . $sigFile->getClientOriginalExtension();
                $sigPath = $sigFile->storeAs('signatures', $filename, 'public');
            } elseif ($oldReq && $oldReq->file_ttd_digital_path) {
                $sigPath = $oldReq->file_ttd_digital_path;
            }

            $letterRequest = LetterRequest::create([
                'mahasiswa_id' => $mahasiswa->id,
                'category_id' => $request->category_id,
                'status' => 'diajukan',
                'tanggal_pengajuan' => now()->toDateString(),
                'file_ttd_digital_path' => $sigPath,
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

            // Process uploaded requirements or copy from old request
            $uploadedReqIds = [];
            if ($request->has('requirements')) {
                foreach ($request->requirements as $req) {
                    $reqId = $req['requirement_id'];
                    $filePath = null;
                    if (isset($req['file']) && $req['file'] instanceof \Illuminate\Http\UploadedFile) {
                        $f = $req['file'];
                        $fn = time() . '_req_' . $reqId . '_' . $f->getClientOriginalName();
                        $filePath = $f->storeAs('requirements_uploads', $fn, 'public');
                    }
                    if ($filePath) {
                        $uploadedReqIds[] = $reqId;
                        LetterRequestRequirement::create([
                            'request_id' => $letterRequest->id,
                            'requirement_id' => $reqId,
                            'file_path' => $filePath,
                        ]);
                    }
                }
            }

            // Copy remaining requirements from old request if re-applying
            if ($oldReq) {
                foreach ($oldReq->requestRequirements as $oldRequirement) {
                    if (!in_array($oldRequirement->requirement_id, $uploadedReqIds, true) && $oldRequirement->file_path) {
                        LetterRequestRequirement::create([
                            'request_id' => $letterRequest->id,
                            'requirement_id' => $oldRequirement->requirement_id,
                            'file_path' => $oldRequirement->file_path,
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

    /**
     * Download completed letter for student
     */
    public function downloadLetter(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = $user->mahasiswa;

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil mahasiswa tidak ditemukan.',
            ], 403);
        }

        $letterRequest = LetterRequest::with(['category', 'mahasiswa', 'values.variable'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        if ($letterRequest->status !== 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Surat belum selesai diproses oleh admin.',
            ], 400);
        }

        // If file_hasil_path is missing, generate on demand
        if (!$letterRequest->file_hasil_path || !Storage::disk('public')->exists($letterRequest->file_hasil_path)) {
            $generated = \App\Services\DocumentGeneratorService::generate($letterRequest);
            if ($generated) {
                $letterRequest->file_hasil_path = $generated;
                $letterRequest->save();
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File surat tidak ditemukan atau template belum disiapkan admin.',
                ], 404);
            }
        }

        $fullPath = Storage::disk('public')->path($letterRequest->file_hasil_path);
        return response()->download($fullPath);
    }
}
