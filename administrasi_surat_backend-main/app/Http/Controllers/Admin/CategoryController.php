<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LetterCategory;
use App\Models\LetterRequirement;
use App\Models\LetterVariable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Get all categories with requirements and variables
     */
    public function index()
    {
        $categories = LetterCategory::with(['requirements', 'variables'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Create new Letter Category with template file, requirements & variables
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'file_template' => 'nullable|file|mimes:docx',
            'ttd_digital' => 'nullable|boolean',
            'requirements' => 'nullable|array',
            'requirements.*.nama_syarat' => 'required|string',
            'requirements.*.tipe_file' => 'required|string',
            'variables' => 'nullable|array',
            'variables.*.nama_variabel' => 'required|string',
            'variables.*.tipe_input_html' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $templatePath = null;
            if ($request->hasFile('file_template')) {
                $file = $request->file('file_template');
                $filename = time() . '_' . $file->getClientOriginalName();
                $templatePath = $file->storeAs('templates', $filename, 'public');
            }

            $category = LetterCategory::create([
                'nama_kategori' => $request->nama_kategori,
                'deskripsi' => $request->deskripsi,
                'file_template_path' => $templatePath,
                'ttd_digital' => $request->boolean('ttd_digital'),
            ]);

            if ($request->has('requirements')) {
                foreach ($request->requirements as $req) {
                    $category->requirements()->create([
                        'nama_syarat' => $req['nama_syarat'],
                        'tipe_file' => $req['tipe_file'],
                    ]);
                }
            }

            if ($request->has('variables')) {
                foreach ($request->variables as $var) {
                    $category->variables()->create([
                        'nama_variabel' => $var['nama_variabel'],
                        'tipe_input_html' => $var['tipe_input_html'],
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Kategori surat berhasil ditambahkan',
                'data' => $category->load(['requirements', 'variables']),
            ], 201);
        });
    }

    /**
     * Show category detail
     */
    public function show($id)
    {
        $category = LetterCategory::with(['requirements', 'variables'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $category,
        ]);
    }

    /**
     * Update Category, Requirements, and Variables
     */
    public function update(Request $request, $id)
    {
        $category = LetterCategory::findOrFail($id);

        $request->validate([
            'nama_kategori' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'file_template' => 'nullable|file|mimes:docx',
            'ttd_digital' => 'nullable',
            'requirements' => 'nullable|array',
            'variables' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $category) {
            if ($request->hasFile('file_template')) {
                // Remove old template if exists
                if ($category->file_template_path && Storage::disk('public')->exists($category->file_template_path)) {
                    Storage::disk('public')->delete($category->file_template_path);
                }
                $file = $request->file('file_template');
                $filename = time() . '_' . $file->getClientOriginalName();
                $category->file_template_path = $file->storeAs('templates', $filename, 'public');
            }

            if ($request->has('nama_kategori')) {
                $category->nama_kategori = $request->nama_kategori;
            }
            if ($request->has('deskripsi')) {
                $category->deskripsi = $request->deskripsi;
            }
            if ($request->has('ttd_digital')) {
                $category->ttd_digital = $request->boolean('ttd_digital');
            }
            $category->save();

            // Update Requirements if provided
            if ($request->has('requirements')) {
                $category->requirements()->delete();
                foreach ($request->requirements as $req) {
                    $category->requirements()->create([
                        'nama_syarat' => $req['nama_syarat'],
                        'tipe_file' => $req['tipe_file'],
                    ]);
                }
            }

            // Update Variables if provided
            if ($request->has('variables')) {
                $category->variables()->delete();
                foreach ($request->variables as $var) {
                    $category->variables()->create([
                        'nama_variabel' => $var['nama_variabel'],
                        'tipe_input_html' => $var['tipe_input_html'],
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Kategori surat berhasil diperbarui',
                'data' => $category->load(['requirements', 'variables']),
            ]);
        });
    }

    /**
     * Delete Category
     */
    public function destroy($id)
    {
        $category = LetterCategory::findOrFail($id);
        if ($category->file_template_path && Storage::disk('public')->exists($category->file_template_path)) {
            Storage::disk('public')->delete($category->file_template_path);
        }
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori surat berhasil dihapus',
        ]);
    }
}
