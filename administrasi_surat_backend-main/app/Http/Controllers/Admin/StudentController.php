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
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'username' => $request->nim,
                'password' => Hash::make($request->nim),
                'role' => 'mahasiswa',
            ]);

            $mahasiswa = Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $request->nim,
                'nama' => $request->nama,
                'prodi' => $request->prodi,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil ditambahkan.',
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
        ]);

        $mahasiswa->update([
            'nim' => $request->nim,
            'nama' => $request->nama,
            'prodi' => $request->prodi,
        ]);

        // Update username to match NIM
        if ($mahasiswa->user) {
            $mahasiswa->user->update(['username' => $request->nim]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data mahasiswa berhasil diperbarui.',
            'data' => $mahasiswa->fresh('user'),
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
                'message' => 'Data mahasiswa berhasil di-import.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal meng-import data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
