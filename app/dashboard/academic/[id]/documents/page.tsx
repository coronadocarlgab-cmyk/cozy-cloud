'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, UploadCloud, FileText, Trash2, Download, Image as ImageIcon, Loader2, Check, AlertCircle, Eye, Edit2, X, ZoomIn } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Doc = {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

const SUCCESS_MESSAGES = [
  "All tucked away safely! 💖",
  "Organized and ready to go! ✨",
  "One less thing to worry about! 🌸",
  "Your sanctuary is growing! ☁️",
  "Renamed and refreshed! 📝"
]

export default function DocumentRepo() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  // Data State
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Modals
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'error' | 'success' | 'delete' | 'rename' | null;
    message?: string;
    targetId?: string; 
    filePath?: string;
    inputValue?: string;
  }>({ isOpen: false, type: null, inputValue: '' })

  // --- NEW: FILE VIEWER STATE ---
  const [fileViewer, setFileViewer] = useState<{
    isOpen: boolean;
    url: string | null;
    type: string | null;
    name: string | null;
  }>({ isOpen: false, url: null, type: null, name: null })

  // --- FETCH DOCS ---
  const fetchDocs = async () => {
    const { data } = await supabase
      .from('trip_documents')
      .select('*')
      .eq('itinerary_id', id)
      .order('created_at', { ascending: false })
    
    if (data) setDocs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDocs()
  }, [id])

  // --- 1. FILE SELECTION (UPDATED PREVIEW LOGIC) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    
    // Size limit 50MB
    if (file.size > 50 * 1024 * 1024) {
      setModal({ isOpen: true, type: 'error', message: "File is too big! Max 50MB please. 🍃" })
      return
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setModal({ isOpen: true, type: 'error', message: "Oops! Only PDF, JPG, or PNG files. 📄" })
      return
    }

    // Set Preview (Works for PDF & Image)
    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    
    e.target.value = '' 
  }

  const handleCancelSelection = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const fileExt = selectedFile.name.split('.').pop()
    const filePath = `${user.id}/${id}/${Date.now()}.${fileExt}` 

    const { error: uploadError } = await supabase.storage
      .from('trip-docs')
      .upload(filePath, selectedFile)

    if (uploadError) {
      setModal({ isOpen: true, type: 'error', message: uploadError.message })
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('trip_documents')
      .insert([{
        itinerary_id: id,
        user_id: user.id,
        file_name: selectedFile.name,
        file_path: filePath,
        file_type: selectedFile.type,
        file_size: selectedFile.size
      }])

    if (dbError) {
      setModal({ isOpen: true, type: 'error', message: dbError.message })
    } else {
      const randomMsg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]
      setModal({ isOpen: true, type: 'success', message: randomMsg })
      handleCancelSelection() 
      fetchDocs() 
    }
    setUploading(false)
  }

  // --- DELETE HANDLERS ---
  const promptDelete = (docId: string, filePath: string) => {
    setModal({ 
      isOpen: true, 
      type: 'delete', 
      message: "Are you sure you want to remove this file?",
      targetId: docId,
      filePath: filePath
    })
  }

  const confirmDelete = async () => {
    if (modal.targetId && modal.filePath) {
      await supabase.storage.from('trip-docs').remove([modal.filePath])
      await supabase.from('trip_documents').delete().eq('id', modal.targetId)
      fetchDocs()
      setModal({ isOpen: false, type: null })
    }
  }

  // --- RENAME HANDLERS ---
  const promptRename = (docId: string, currentName: string) => {
    setModal({
      isOpen: true,
      type: 'rename',
      message: "Give this file a new name:",
      targetId: docId,
      inputValue: currentName
    })
  }

  const confirmRename = async () => {
    if (modal.targetId && modal.inputValue) {
      const { error } = await supabase
        .from('trip_documents')
        .update({ file_name: modal.inputValue })
        .eq('id', modal.targetId)

      if (error) {
        setModal({ isOpen: true, type: 'error', message: "Could not rename file. 😔" })
      } else {
        fetchDocs()
        setModal({ isOpen: true, type: 'success', message: "Renamed successfully! 📝" })
      }
    }
  }

  // --- DOWNLOAD HANDLER ---
  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('trip-docs').download(filePath)

    if (error) {
      setModal({ isOpen: true, type: 'error', message: "Could not download file. 😔" })
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- NEW: PREVIEW STORED FILE HANDLER ---
  const handlePreviewStored = async (doc: Doc) => {
    // We need a temporary public URL to show it in an iframe/img
    // Supabase Signed URLs are perfect for this (valid for 60 seconds)
    const { data, error } = await supabase.storage
      .from('trip-docs')
      .createSignedUrl(doc.file_path, 60)

    if (error || !data) {
      setModal({ isOpen: true, type: 'error', message: "Could not load preview. 😔" })
      return
    }

    setFileViewer({
      isOpen: true,
      url: data.signedUrl,
      type: doc.file_type,
      name: doc.file_name
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/academic/${id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-cozy-sage" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-cozy-text">Travel Documents</h1>
          <p className="text-cozy-sage text-sm">Safe keeping for tickets & vouchers.</p>
        </div>
      </div>

      {/* --- UPLOAD AREA --- */}
      {!selectedFile ? (
        <div className="bg-white rounded-3xl p-10 shadow-soft border-2 border-dashed border-cozy-pink/30 hover:border-cozy-pink transition-all text-center relative group cursor-pointer">
          <input 
            type="file" 
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          />
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="w-20 h-20 bg-pink-50 text-cozy-pink rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cozy-text">Tap to Upload File</h3>
              <p className="text-sm text-gray-400 mt-1">Supports PDF, JPG, PNG • Max 50MB</p>
            </div>
          </div>
        </div>
      ) : (
        // STATE B: PREVIEW & CONFIRM
        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-cozy-pink animate-in fade-in zoom-in-95 duration-200">
          <h3 className="font-bold text-cozy-text mb-6 flex items-center gap-2">
            <Eye size={20} className="text-blue-400" /> Preview Selection
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            
            {/* The Preview Box (Updated for PDF) */}
            <div className="w-full md:w-1/2 h-64 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative">
              {previewUrl && selectedFile.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : previewUrl && selectedFile.type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-full" title="PDF Preview"></iframe>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FileText size={64} className="text-cozy-pink mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Document Preview</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">File Name</p>
                <p className="text-lg font-bold text-cozy-text truncate">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</p>
                <p className="text-cozy-sage font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleCancelSelection}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="flex-1 py-3 bg-cozy-pink hover:bg-pink-300 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={18} />}
                  {uploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FILE LIST --- */}
      <div className="space-y-4">
        <h3 className="font-bold text-cozy-text ml-2 flex items-center gap-2">
          Stored Files <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">{docs.length}</span>
        </h3>

        {docs.length === 0 && !loading && (
             <div className="text-center py-12 text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                No documents yet. Upload your first one above! 📄
             </div>
        )}

        {docs.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-100 flex items-center justify-between group transition-all">
                
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                        {doc.file_type?.startsWith('image') ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-cozy-text truncate pr-4">{doc.file_name}</h4>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* PREVIEW BUTTON (NEW) */}
                    <button 
                        onClick={() => handlePreviewStored(doc)}
                        className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"
                        title="Preview"
                    >
                        <Eye size={18} />
                    </button>
                    
                    <button 
                        onClick={() => handleDownload(doc.file_path, doc.file_name)}
                        className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                    
                    <button 
                        onClick={() => promptRename(doc.id, doc.file_name)}
                        className="p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-colors"
                        title="Rename"
                    >
                        <Edit2 size={18} />
                    </button>
                    
                    <button 
                        onClick={() => promptDelete(doc.id, doc.file_path)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* --- COZY MODAL SYSTEM (Alerts/Rename) --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all"
            onClick={() => setModal({ ...modal, isOpen: false })}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 border-4 border-white ring-4 ring-cozy-pink/20 animate-in zoom-in-95 duration-200 text-center">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modal.type === 'error' ? 'bg-red-50 text-red-400' :
              modal.type === 'success' ? 'bg-green-50 text-green-500' :
              modal.type === 'rename' ? 'bg-yellow-50 text-yellow-500' :
              'bg-blue-50 text-blue-400'
            }`}>
              {modal.type === 'error' && <AlertCircle size={32} />}
              {modal.type === 'success' && <Check size={32} />}
              {modal.type === 'delete' && <Trash2 size={32} />}
              {modal.type === 'rename' && <Edit2 size={32} />}
            </div>

            <h3 className="text-xl font-bold text-cozy-text mb-2">
              {modal.type === 'error' ? 'Oh no!' :
               modal.type === 'success' ? 'Success!' :
               modal.type === 'rename' ? 'Rename File' :
               'Remove File?'}
            </h3>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {modal.message}
            </p>

            {modal.type === 'rename' && (
              <div className="mb-6">
                <input 
                  type="text" 
                  autoFocus
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-200 rounded-xl py-3 px-4 font-bold text-cozy-text outline-none text-center"
                  value={modal.inputValue}
                  onChange={(e) => setModal({...modal, inputValue: e.target.value})}
                />
              </div>
            )}

            {modal.type === 'delete' || modal.type === 'rename' ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={modal.type === 'delete' ? confirmDelete : confirmRename}
                  className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95 ${
                    modal.type === 'delete' ? 'bg-red-400 hover:bg-red-500' : 'bg-yellow-400 hover:bg-yellow-500'
                  }`}
                >
                  {modal.type === 'delete' ? 'Yes, Delete' : 'Save Name'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="w-full py-3 bg-cozy-text text-white rounded-xl font-bold shadow-md hover:bg-gray-700 transition-transform active:scale-95"
              >
                Okay, got it!
              </button>
            )}

          </div>
        </div>
      )}

      {/* --- NEW: FILE VIEWER MODAL (Large Gallery View) --- */}
      {fileViewer.isOpen && fileViewer.url && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          
          <div 
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md transition-all"
            onClick={() => setFileViewer({ ...fileViewer, isOpen: false, url: null })}
          ></div>

          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <h3 className="font-bold text-cozy-text truncate flex items-center gap-2">
                <ZoomIn size={18} className="text-cozy-pink" /> 
                {fileViewer.name}
              </h3>
              <button 
                onClick={() => setFileViewer({ ...fileViewer, isOpen: false, url: null })}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center overflow-hidden relative">
               {fileViewer.type?.startsWith('image/') ? (
                 <img src={fileViewer.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
               ) : fileViewer.type === 'application/pdf' ? (
                 <iframe src={fileViewer.url} className="w-full h-full rounded-lg shadow-sm border border-gray-200 bg-white" title="PDF Viewer"></iframe>
               ) : (
                 <div className="text-center text-gray-400">
                    <FileText size={64} className="mx-auto mb-4 text-cozy-sage" />
                    <p>Preview not available for this file type.</p>
                 </div>
               )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}