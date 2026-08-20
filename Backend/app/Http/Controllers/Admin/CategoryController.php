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
            'file_template' => 'nullable|file|mimes:docx|max:10240',
            'file_template_permohonan' => 'nullable|file|mimes:docx|max:10240',
            'file_template_pengantar' => 'nullable|file|mimes:docx|max:10240',
            'ttd_digital' => 'nullable|boolean',
            'requirements' => 'nullable|array',
            'requirements.*.nama_syarat' => 'required|string',
            'requirements.*.tipe_file' => 'required|string',
            'variables' => 'nullable|array',
            'variables.*.nama_variabel' => 'required|string',
            'variables.*.tipe_input_html' => 'required|string',
        ], [
            'file_template.max' => 'Ukuran file template maksimal 10MB.',
            'file_template_permohonan.max' => 'Ukuran file template permohonan maksimal 10MB.',
            'file_template_pengantar.max' => 'Ukuran file template pengantar maksimal 10MB.',
        ]);

        return DB::transaction(function () use ($request) {
            $templatePath = null;
            $templatePermohonanPath = null;
            $templatePengantarPath = null;

            if ($request->hasFile('file_template')) {
                $file = $request->file('file_template');
                $filename = time() . '_tpl_' . $file->getClientOriginalName();
                $templatePath = $file->storeAs('templates', $filename, 'public');
            }

            if ($request->hasFile('file_template_permohonan')) {
                $file = $request->file('file_template_permohonan');
                $filename = time() . '_permohonan_' . $file->getClientOriginalName();
                $templatePermohonanPath = $file->storeAs('templates', $filename, 'public');
            } else {
                $templatePermohonanPath = $templatePath;
            }

            if ($request->hasFile('file_template_pengantar')) {
                $file = $request->file('file_template_pengantar');
                $filename = time() . '_pengantar_' . $file->getClientOriginalName();
                $templatePengantarPath = $file->storeAs('templates', $filename, 'public');
            } else {
                $templatePengantarPath = $templatePath;
            }

            $category = LetterCategory::create([
                'nama_kategori' => $request->nama_kategori,
                'grup_kategori' => $request->grup_kategori ?: 'Akademik',
                'deskripsi' => $request->deskripsi,
                'file_template_path' => $templatePath ?: $templatePermohonanPath,
                'file_template_permohonan_path' => $templatePermohonanPath,
                'file_template_pengantar_path' => $templatePengantarPath,
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
            'file_template' => 'nullable|file|mimes:docx|max:10240',
            'file_template_permohonan' => 'nullable|file|mimes:docx|max:10240',
            'file_template_pengantar' => 'nullable|file|mimes:docx|max:10240',
            'ttd_digital' => 'nullable',
            'requirements' => 'nullable|array',
            'variables' => 'nullable|array',
        ], [
            'file_template.max' => 'Ukuran file template maksimal 10MB.',
            'file_template_permohonan.max' => 'Ukuran file template permohonan maksimal 10MB.',
            'file_template_pengantar.max' => 'Ukuran file template pengantar maksimal 10MB.',
        ]);

        return DB::transaction(function () use ($request, $category) {
            if ($request->hasFile('file_template')) {
                if ($category->file_template_path && Storage::disk('public')->exists($category->file_template_path)) {
                    Storage::disk('public')->delete($category->file_template_path);
                }
                $file = $request->file('file_template');
                $filename = time() . '_tpl_' . $file->getClientOriginalName();
                $category->file_template_path = $file->storeAs('templates', $filename, 'public');
            }

            if ($request->hasFile('file_template_permohonan')) {
                if ($category->file_template_permohonan_path && Storage::disk('public')->exists($category->file_template_permohonan_path)) {
                    Storage::disk('public')->delete($category->file_template_permohonan_path);
                }
                $file = $request->file('file_template_permohonan');
                $filename = time() . '_permohonan_' . $file->getClientOriginalName();
                $category->file_template_permohonan_path = $file->storeAs('templates', $filename, 'public');
            }

            if ($request->hasFile('file_template_pengantar')) {
                if ($category->file_template_pengantar_path && Storage::disk('public')->exists($category->file_template_pengantar_path)) {
                    Storage::disk('public')->delete($category->file_template_pengantar_path);
                }
                $file = $request->file('file_template_pengantar');
                $filename = time() . '_pengantar_' . $file->getClientOriginalName();
                $category->file_template_pengantar_path = $file->storeAs('templates', $filename, 'public');
            }

            if ($request->has('nama_kategori')) {
                $category->nama_kategori = $request->nama_kategori;
            }
            if ($request->has('grup_kategori')) {
                $category->grup_kategori = $request->grup_kategori;
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
        $category->delete(); // Soft delete category

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori surat berhasil dihapus',
        ]);
    }
}
