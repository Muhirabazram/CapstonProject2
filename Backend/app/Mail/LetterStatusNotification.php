<?php

namespace App\Mail;

use App\Models\LetterRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LetterStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public LetterRequest $letterRequest;

    /**
     * Create a new message instance.
     */
    public function __construct(LetterRequest $letterRequest)
    {
        $this->letterRequest = $letterRequest;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $reqId = '#REQ-' . str_pad($this->letterRequest->id, 3, '0', STR_PAD_LEFT);
        $status = ucfirst($this->letterRequest->status);
        $category = $this->letterRequest->category ? $this->letterRequest->category->nama_kategori : 'Surat';

        $subject = match ($this->letterRequest->status) {
            'selesai' => "[SIASMA] Surat {$category} Anda Telah Selesai ({$reqId})",
            'ditolak' => "[SIASMA] Permohonan Surat {$category} Ditolak ({$reqId})",
            'diproses' => "[SIASMA] Permohonan Surat {$category} Sedang Diproses ({$reqId})",
            'diterima' => "[SIASMA] Permohonan Surat {$category} Diterima ({$reqId})",
            default => "[SIASMA] Update Status Pengajuan Surat ({$reqId})"
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.letter_status',
            with: [
                'letterRequest' => $this->letterRequest,
                'mahasiswa' => $this->letterRequest->mahasiswa,
                'category' => $this->letterRequest->category,
                'status' => $this->letterRequest->status,
                'alasanPenolakan' => $this->letterRequest->alasan_penolakan,
                'reqCode' => '#REQ-' . str_pad($this->letterRequest->id, 3, '0', STR_PAD_LEFT),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
