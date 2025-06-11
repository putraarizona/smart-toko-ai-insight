
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getProductCategories, createProductCategory, updateProductCategory, deleteProductCategory } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type ProductCategory = Database['public']['Tables']['product_categories']['Row'];

const MasterKategoriModule = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await updateProductCategory(editId, formData);
        toast({
          title: "Berhasil",
          description: "Kategori berhasil diperbarui"
        });
      } else {
        await createProductCategory(formData);
        toast({
          title: "Berhasil",
          description: "Kategori berhasil ditambahkan"
        });
      }
      await loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan kategori",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setShowAddForm(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (category: ProductCategory) => {
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    setEditMode(true);
    setEditId(category.id);
    setShowAddForm(true);
  };

  const handleDelete = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      await deleteProductCategory(selectedCategory.id);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus"
      });
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Kategori Produk</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editMode ? 'Edit' : 'Tambah'} Kategori</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit">
                  {editMode ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kategori "{selectedCategory?.name}" secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MasterKategoriModule;
