<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\StudentsImport;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Exception;

class StudentController extends Controller
{
    /**
     * List all students
     */
    public function index()
    {
        $students = Mahasiswa::with('user')->get();

        return response()->json([
            'status' => 'success',
            'data' => $students,
        ]);
    }

    /**
     * Create a new student
     */
    public function store(Request $request)
    {
        $request->validate([
            'nim' => 'required|string|max:20|unique:mahasiswas,nim',
            'nama' => 'required|string|max:255',
            'prodi' => 'required|string|max:255',
            'angkatan' => 'nullable|string|max:10',
            'jenis_kelamin' => 'nullable|in:L,P',
            'jenis_mahasiswa' => 'nullable|in:Reguler,Kelas Karyawan',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string|max:500',
            'dosen_wali' => 'nullable|string|max:100',
            'status_mahasiswa' => 'nullable|in:Aktif,Cuti,Lulus,Keluar',
        ]);

        return DB::transaction(function () use ($request) {
            $defaultUsnPw = 'stmik' . trim($request->nim);

            $user = User::create([
                'username' => $defaultUsnPw,
                'password' => Hash::make($defaultUsnPw),
                'role' => 'mahasiswa',
            ]);

            $mahasiswa = Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $request->nim,
                'nama' => $request->nama,
                'prodi' => $request->prodi,
                'angkatan' => $request->angkatan,
                'jenis_kelamin' => $request->jenis_kelamin,
                'jenis_mahasiswa' => $request->jenis_mahasiswa ?? 'Reguler',
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'alamat' => $request->alamat,
                'dosen_wali' => $request->dosen_wali,
                'status_mahasiswa' => $request->status_mahasiswa ?? 'Aktif',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil ditambahkan. Username & Password default: ' . $defaultUsnPw,
                'data' => $mahasiswa->load('user'),
            ], 201);
        });
    }

    /**
     * Update a student
     */
    public function update(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $request->validate([
            'nim' => 'required|string|max:20|unique:mahasiswas,nim,' . $id,
            'nama' => 'required|string|max:255',
            'prodi' => 'required|string|max:255',
            'angkatan' => 'nullable|string|max:10',
            'jenis_kelamin' => 'nullable|in:L,P',
            'jenis_mahasiswa' => 'nullable|in:Reguler,Kelas Karyawan',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string|max:500',
            'dosen_wali' => 'nullable|string|max:100',
            'status_mahasiswa' => 'nullable|in:Aktif,Cuti,Lulus,Keluar',
        ]);

        $mahasiswa->update([
            'nim' => $request->nim,
            'nama' => $request->nama,
            'prodi' => $request->prodi,
            'angkatan' => $request->angkatan,
            'jenis_kelamin' => $request->jenis_kelamin,
            'jenis_mahasiswa' => $request->jenis_mahasiswa,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'alamat' => $request->alamat,
            'dosen_wali' => $request->dosen_wali,
            'status_mahasiswa' => $request->status_mahasiswa,
        ]);

        if ($mahasiswa->user) {
            $defaultUsnPw = 'stmik' . trim($request->nim);
            $mahasiswa->user->update(['username' => $defaultUsnPw]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data mahasiswa berhasil diperbarui.',
            'data' => $mahasiswa->fresh('user'),
        ]);
    }

    /**
     * Reset student password to default (stmik[NIM])
     */
    public function resetPassword($id)
    {
        $mahasiswa = Mahasiswa::with('user')->findOrFail($id);

        if (!$mahasiswa->user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun user mahasiswa tidak ditemukan.',
            ], 404);
        }

        $defaultUsnPw = 'stmik' . trim($mahasiswa->nim);
        $mahasiswa->user->update([
            'username' => $defaultUsnPw,
            'password' => Hash::make($defaultUsnPw),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password & Username mahasiswa berhasil di-reset ke default: ' . $defaultUsnPw,
        ]);
    }

    /**
     * Delete a student
     */
    public function destroy($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        if ($mahasiswa->user) {
            $mahasiswa->user->delete();
        }
        $mahasiswa->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data mahasiswa berhasil dihapus.',
        ]);
    }

    /**
     * Bulk Import Students from Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            Excel::import(new StudentsImport, $request->file('excel_file'));

            return response()->json([
                'status' => 'success',
                'message' => 'Data mahasiswa berhasil di-import. Username & Password default diset ke stmik[NIM].',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal meng-import data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
