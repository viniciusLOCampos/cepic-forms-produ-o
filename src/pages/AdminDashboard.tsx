import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCPF, formatPhone } from '@/lib/validations';
import { 
  Users, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Search,
  Shield,
  RefreshCw
} from 'lucide-react';

interface FormularioData {
  id: number;
  nome: string;
  email: string;
  cpf: number;
  celular: number;
  numero_registro: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<FormularioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cpf' | 'email' | 'numero'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FormularioData | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    numero_registro: ''
  });

  const { logout, adminLogin } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('formulario_cepic')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextNumeroSorteio = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_numero_sorteio');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      return Math.max(...users.map(u => u.numero_registro || 0)) + 1;
    }
  };

  const handleAddUser = async () => {
    try {
      const nextNumber = await getNextNumeroSorteio();
      
      const { error } = await supabase
        .from('formulario_cepic')
        .insert({
          nome: formData.nome,
          email: formData.email,
          cpf: parseInt(formData.cpf.replace(/\D/g, '')),
          celular: parseInt(formData.celular.replace(/\D/g, '')),
          numero_registro: parseInt(formData.numero_registro) || nextNumber
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso.",
        className: "bg-white border border-gray-200 text-gray-900",
        duration: 3000
      });

      setIsAddModalOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    console.log('handleEditUser chamado com:', {
      selectedUser,
      formData
    });

    try {
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        cpf: parseInt(formData.cpf.replace(/\D/g, '')),
        celular: parseInt(formData.celular.replace(/\D/g, '')),
        numero_registro: parseInt(formData.numero_registro)
      };

      console.log('Dados para atualização:', updateData);

      const { data, error } = await supabase
        .from('formulario_cepic')
        .update(updateData)
        .eq('id', selectedUser.id)
        .select();

      console.log('Resultado da atualização:', { data, error });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
        className: "bg-white border border-gray-200 text-gray-900",
        duration: 3000
      });

      setIsEditModalOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    console.log('handleDeleteUser chamado com:', selectedUser);

    try {
      const { data, error } = await supabase
        .from('formulario_cepic')
        .delete()
        .eq('id', selectedUser.id)
        .select();

      console.log('Resultado da exclusão:', { data, error });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
        className: "bg-white border border-gray-200 text-gray-900",
        duration: 3000
      });

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'CPF', 'Celular', 'Número de Registro', 'Data Cadastro'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.nome}"`,
        `"${user.email}"`,
        formatCPF(user.cpf.toString()),
        formatPhone(user.celular.toString()),
        user.numero_registro,
        new Date(user.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_cepic_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      cpf: '',
      celular: '',
      numero_registro: ''
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: FormularioData) => {
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      cpf: formatCPF(user.cpf.toString()),
      celular: formatPhone(user.celular.toString()),
      numero_registro: user.numero_registro.toString()
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: FormularioData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    switch (filterType) {
      case 'cpf':
        return formatCPF(user.cpf.toString()).includes(searchTerm);
      case 'email':
        return user.email.toLowerCase().includes(searchTerm.toLowerCase());
      case 'numero':
        return user.numero_registro.toString().includes(searchTerm);
      default:
        return user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               formatCPF(user.cpf.toString()).includes(searchTerm) ||
               formatPhone(user.celular.toString()).includes(searchTerm);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-border border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Logado como: {adminLogin}</p>
              </div>
            </div>
            <Button onClick={handleLogout} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-card-foreground">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Usuários Filtrados</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-card-foreground">{filteredUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Último Número</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-card-foreground">
                {Math.max(...users.map(u => u.numero_registro || 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-white border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Gerenciar Usuários</CardTitle>
            <CardDescription className="text-gray-600">
              Visualize, edite, adicione ou remova usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilterType('all')}
                  size="sm"
                  className={filterType === 'all' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                >
                  Todos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilterType('cpf')}
                  size="sm"
                  className={filterType === 'cpf' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                >
                  CPF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilterType('email')}
                  size="sm"
                  className={filterType === 'email' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                >
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilterType('numero')}
                  size="sm"
                  className={filterType === 'numero' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                >
                  Num Registro
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={
                      filterType === 'cpf' ? "Buscar por CPF..." :
                      filterType === 'email' ? "Buscar por email..." :
                      filterType === 'numero' ? "Buscar por número de registro..." :
                      "Buscar por CPF, Email ou Num Registro..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button onClick={loadUsers} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button onClick={handleDownloadCSV} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Nº Registro</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatCPF(user.cpf.toString())}</TableCell>
                      <TableCell>{formatPhone(user.celular.toString())}</TableCell>
                      <TableCell>{user.numero_registro}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={() => openDeleteModal(user)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Adicionar Usuário</DialogTitle>
            <DialogDescription className="text-gray-600">
              Preencha os dados para adicionar um novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                placeholder="000.000.000-00"
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="celular" className="text-sm font-medium text-gray-700">Celular</Label>
              <Input
                id="celular"
                value={formData.celular}
                onChange={(e) => setFormData({...formData, celular: formatPhone(e.target.value)})}
                placeholder="(00) 00000-0000"
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numero_registro" className="text-sm font-medium text-gray-700">Número de Registro (opcional)</Label>
              <Input
                id="numero_registro"
                type="number"
                value={formData.numero_registro}
                onChange={(e) => setFormData({...formData, numero_registro: e.target.value})}
                placeholder="Deixe em branco para gerar automaticamente"
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {setIsAddModalOpen(false); resetForm();}}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddUser} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Editar Usuário</DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifique os dados do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome" className="text-sm font-medium text-gray-700">Nome</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cpf" className="text-sm font-medium text-gray-700">CPF</Label>
              <Input
                id="edit-cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-celular" className="text-sm font-medium text-gray-700">Celular</Label>
              <Input
                id="edit-celular"
                value={formData.celular}
                onChange={(e) => setFormData({...formData, celular: formatPhone(e.target.value)})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-numero_registro" className="text-sm font-medium text-gray-700">Número de Registro</Label>
              <Input
                id="edit-numero_registro"
                type="number"
                value={formData.numero_registro}
                onChange={(e) => setFormData({...formData, numero_registro: e.target.value})}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {setIsEditModalOpen(false); resetForm();}}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-gray-600">
              Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p><strong>Nome:</strong> {selectedUser.nome}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>CPF:</strong> {formatCPF(selectedUser.cpf.toString())}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {setIsDeleteModalOpen(false); setSelectedUser(null);}}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;