import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, DocumentItem } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Lock,
  Download,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function DocumentsView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('CONTRACT');
  const [fileName, setFileName] = useState('');

  const loadData = () => {
    setDocuments(db.getDocuments());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredDocs = documents.filter(d => {
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addDocument({
      title,
      category,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSizeBytes: 1850000,
      fileUrl: '#',
      mimeType: 'application/pdf',
      isRestricted: category === 'CONTRACT' || category === 'TAX_FORM',
    });
    setIsUploadOpen(false);
    setTitle('');
    setFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Document Management
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Secure, encrypted tenant repository for contracts, company policies, tax documents, and verification records.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
          <UploadCloud className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-border shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents by title or file name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="CONTRACT">Contracts & NDAs</option>
          <option value="POLICY">Policies & Handbooks</option>
          <option value="IDENTIFICATION">Identifications</option>
          <option value="TAX_FORM">Tax Forms</option>
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <Card key={doc.id} className="p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge variant={doc.isRestricted ? 'danger' : 'info'} size="sm">
                  {doc.category}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-text-primary leading-snug">{doc.title}</h4>
                <p className="text-xs text-neutral-text-muted font-mono mt-1 truncate">{doc.fileName}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-border/60 flex items-center justify-between text-xs">
              <span className="text-neutral-text-muted">
                {formatDate(doc.createdAt)}
              </span>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  alert(`Downloading securely: ${doc.fileName}`);
                }}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Document Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document"
        description="Store an encrypted document in the tenant repository."
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 2026 Remote Work Security Policy"
          />

          <Select
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value as any)}
            options={[
              { value: 'CONTRACT', label: 'Contract & NDA' },
              { value: 'POLICY', label: 'Policy & Handbook' },
              { value: 'IDENTIFICATION', label: 'Identification / Pass' },
              { value: 'TAX_FORM', label: 'Tax & Compliance Form' },
            ]}
          />

          <Input
            label="File Name"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="e.g. Remote_Work_Policy_2026.pdf"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Upload & Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
