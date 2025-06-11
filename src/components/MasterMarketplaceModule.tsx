
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getMarketplaceSuppliers, getSupplierAccounts } from '@/integrations/supabase/db';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type MarketplaceSupplier = Database['public']['Tables']['marketplace_suppliers']['Row'];
type SupplierAccount = Database['public']['Tables']['supplier_accounts']['Row'] & {
  marketplace_supplier: MarketplaceSupplier;
};

const MasterMarketplaceModule = () => {
  const [marketplaceSuppliers, setMarketplaceSuppliers] = useState<MarketplaceSupplier[]>([]);
  const [supplierAccounts, setSupplierAccounts] = useState<SupplierAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'marketplace' as 'marketplace' | 'supplier'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [marketplaceData, accountsData] = await Promise.all([
        getMarketplaceSuppliers(),
        getSupplierAccounts()
      ]);
      setMarketplaceSuppliers(marketplaceData);
      setSupplierAccounts(accountsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data marketplace/supplier",
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
        const { error } = await supabase
          .from('marketplace_suppliers')
          .update(formData)
          .eq('id', editId);
        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Marketplace/Supplier berhasil diperbarui"
        });
      } else {
        const { error } = await supabase
          .from('marketplace_suppliers')
          .insert(formData);
        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Marketplace/Supplier berhasil ditambahkan"
        });
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'marketplace' });
    setShowAddForm(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (item: MarketplaceSupplier) => {
    setFormData({ name: item.name, type: item.type as 'marketplace' | 'supplier' });
    setEditMode(true);
    setEditId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('marketplace_suppliers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Berhasil",
        description: "Marketplace/Supplier berhasil dihapus"
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Marketplace/Supplier</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Marketplace/Supplier
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editMode ? 'Edit' : 'Tambah'} Marketplace/Supplier</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'marketplace' | 'supplier' }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="marketplace">Marketplace</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
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
          <CardTitle>Daftar Marketplace/Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah Akun</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketplaceSuppliers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type === 'marketplace' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.type === 'marketplace' ? 'Marketplace' : 'Supplier'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {supplierAccounts.filter(acc => acc.marketplace_supplier_id === item.id).length}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
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

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marketplace/Supplier</TableHead>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.marketplace_supplier.name}</TableCell>
                  <TableCell>{account.account_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.marketplace_supplier.type === 'marketplace' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {account.marketplace_supplier.type === 'marketplace' ? 'Marketplace' : 'Supplier'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterMarketplaceModule;
