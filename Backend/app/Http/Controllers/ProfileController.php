<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get authenticated user's profile
     */
    public function show(Request $request)
    {
        $user = $request->user()->load('mahasiswa');

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    /**
     * Update authenticated user's profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Mahasiswa hanya bisa update nama (user table), tidak bisa edit data pribadi
        if ($user->role === 'mahasiswa') {
            $request->validate([
                'name' => 'nullable|string|max:255',
            ]);

            if ($request->has('name')) {
                $user->update(['name' => $request->name]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui.',
                'data' => $user->fresh()->load('mahasiswa'),
            ]);
        }

        // Admin bisa update semua field
        $request->validate([
            'name' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'angkatan' => 'nullable|string|max:10',
            'jenis_kelamin' => 'nullable|in:L,P',
            'jenis_mahasiswa' => 'nullable|in:Reguler,Kelas Karyawan',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'dosen_wali' => 'nullable|string|max:100',
            'status_mahasiswa' => 'nullable|in:Aktif,Cuti,Lulus,Keluar',
        ]);

        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        if ($user->role === 'admin' && $user->mahasiswa) {
            $profileFields = [
                'alamat', 'angkatan',
                'jenis_kelamin', 'jenis_mahasiswa', 'tempat_lahir',
                'tanggal_lahir', 'dosen_wali', 'status_mahasiswa',
            ];
            $updateData = [];
            foreach ($profileFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }
            if (!empty($updateData)) {
                $user->mahasiswa->update($updateData);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->fresh()->load('mahasiswa'),
        ]);
    }

    /**
     * Change authenticated user's password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'new_password.required' => 'Password baru wajib diisi.',
            'new_password.min' => 'Password baru minimal 6 karakter.',
            'new_password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini yang Anda masukkan salah.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diperbarui.',
        ]);
    }
}
