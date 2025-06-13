
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceSupplier | null>(null);
  
  // Account management states
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [editAccountMode, setEditAccountMode] = useState(false);
  const [editAccountId, setEditAccountId] = useState<number | null>(null);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SupplierAccount | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'marketplace' as 'marketplace' | 'supplier'
  });

  const [accountFormData, setAccountFormData] = useState({
    account_name: '',
    marketplace_supplier_id: 0
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

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editAccountMode && editAccountId) {
        const { error } = await supabase
          .from('supplier_accounts')
          .update(accountFormData)
          .eq('id', editAccountId);
        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Akun berhasil diperbarui"
        });
      } else {
        const { error } = await supabase
          .from('supplier_accounts')
          .insert(accountFormData);
        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Akun berhasil ditambahkan"
        });
      }
      await loadData();
      resetAccountForm();
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan akun",
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

  const resetAccountForm = () => {
    setAccountFormData({ account_name: '', marketplace_supplier_id: 0 });
    setShowAddAccountForm(false);
    setEditAccountMode(false);
    setEditAccountId(null);
  };

  const handleEdit = (item: MarketplaceSupplier) => {
    setFormData({ name: item.name, type: item.type as 'marketplace' | 'supplier' });
    setEditMode(true);
    setEditId(item.id);
    setShowAddForm(true);
  };

  const handleEditAccount = (account: SupplierAccount) => {
    setAccountFormData({
      account_name: account.account_name,
      marketplace_supplier_id: account.marketplace_supplier_id
    });
    setEditAccountMode(true);
    setEditAccountId(account.id);
    setShowAddAccountForm(true);
  };

  const handleDelete = (item: MarketplaceSupplier) => {
    setSelectedMarketplace(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAccount = (account: SupplierAccount) => {
    setSelectedAccount(account);
    setIsDeleteAccountDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMarketplace) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_suppliers')
        .delete()
        .eq('id', selectedMarketplace.id);
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
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMarketplace(null);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      const { error } = await supabase
        .from('supplier_accounts')
        .delete()
        .eq('id', selectedAccount.id);
      if (error) throw error;
      toast({
        title: "Berhasil",
        description: "Akun berhasil dihapus"
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus akun",
        variant: "destructive"
      });
    } finally {
      setIsDeleteAccountDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6 h-screen overflow-auto">
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
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'marketplace' | 'supplier' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
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
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Akun</CardTitle>
            <Button onClick={() => setShowAddAccountForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Akun
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddAccountForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{editAccountMode ? 'Edit' : 'Tambah'} Akun</h3>
                <Button variant="ghost" size="sm" onClick={resetAccountForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_name">Nama Akun</Label>
                    <Input
                      id="account_name"
                      value={accountFormData.account_name}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, account_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketplace_supplier_id">Marketplace/Supplier</Label>
                    <Select
                      value={accountFormData.marketplace_supplier_id.toString()}
                      onValueChange={(value) => setAccountFormData(prev => ({ ...prev, marketplace_supplier_id: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih marketplace/supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {marketplaceSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name} ({supplier.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetAccountForm}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editAccountMode ? 'Simpan Perubahan' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marketplace/Supplier</TableHead>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Aksi</TableHead>
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account)}>
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

      {/* Delete Marketplace Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus "{selectedMarketplace?.name}" secara permanen.
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun "{selectedAccount?.account_name}" secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
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

export default MasterMarketplaceModule;
