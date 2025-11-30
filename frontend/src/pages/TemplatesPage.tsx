import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Copy, Loader } from 'lucide-react';
import client from '../api/client';
import { useToastStore } from '../store/toastStore';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '', category: 'promotional' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await client.get('/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      addToast('Failed to fetch templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await client.put(/templates/, formData);
        addToast('Template updated successfully', 'success');
      } else {
        await client.post('/templates', formData);
        addToast('Template created successfully', 'success');
      }
      setFormData({ name: '', content: '', category: 'promotional' });
      setEditingId(null);
      setShowForm(false);
      fetchTemplates();
    } catch (error) {
      addToast('Failed to save template', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await client.delete(/templates/);
      addToast('Template deleted', 'success');
      fetchTemplates();
    } catch (error) {
      addToast('Failed to delete template', 'error');
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    try {
      await client.post(/templates//duplicate, { name: \ (Copy) });
      addToast('Template duplicated', 'success');
      fetchTemplates();
    } catch (error) {
      addToast('Failed to duplicate template', 'error');
    }
  };

  const handleEdit = (template: Template) => {
    setFormData({ name: template.name, content: template.content, category: template.category });
    setEditingId(template.id);
    setShowForm(true);
  };

  if (loading) return <div className='flex items-center justify-center h-screen'><Loader className='animate-spin' /></div>;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900'>Message Templates</h1>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', content: '', category: 'promotional' }); }}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
          >
            <Plus size={20} /> New Template
          </button>
        </div>

        {showForm && (
          <div className='bg-white p-6 rounded-lg shadow mb-6'>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'><label className='block text-sm font-medium mb-2'>Name</label><input type='text' value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className='w-full border rounded px-3 py-2' required /></div>
              <div className='mb-4'><label className='block text-sm font-medium mb-2'>Content</label><textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className='w-full border rounded px-3 py-2 h-32' required /></div>
              <div className='mb-4'><label className='block text-sm font-medium mb-2'>Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className='w-full border rounded px-3 py-2'><option>promotional</option><option>transactional</option><option>reminder</option></select></div>
              <div className='flex gap-2'><button type='submit' className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>Save</button><button type='button' onClick={() => setShowForm(false)} className='bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400'>Cancel</button></div>
            </form>
          </div>
        )}

        <div className='grid gap-4'>
          {templates.map((template) => (
            <div key={template.id} className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition'>
              <div className='flex justify-between items-start mb-2'><div><h3 className='text-lg font-semibold'>{template.name}</h3><span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>{template.category}</span></div><div className='flex gap-2'><button onClick={() => handleEdit(template)} className='text-blue-600 hover:text-blue-800'><Edit2 size={18} /></button><button onClick={() => handleDuplicate(template.id, template.name)} className='text-green-600 hover:text-green-800'><Copy size={18} /></button><button onClick={() => handleDelete(template.id)} className='text-red-600 hover:text-red-800'><Trash2 size={18} /></button></div></div>
              <p className='text-gray-600 text-sm'>{template.content.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
