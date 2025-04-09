import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Plus, Mail, Check, X, UserX, UserCog, UserCheck } from 'lucide-react';
import { InviteForm } from '@/components/InviteForm';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProjectMembersList } from '@/services/taskService/projectService';

interface Member {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "editor" | "viewer"; // Corrigindo o tipo aqui
}

interface ProjectMembersProps {
  projectId: string;
  isOwnerOrAdmin: boolean;
}

export function ProjectMembers({ projectId, isOwnerOrAdmin }: ProjectMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  const [owner, setOwner] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  async function fetchMembers() {
    try {
      setLoading(true);
      
      // Buscar informações do projeto para identificar o proprietário
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      setOwner(projectData.owner_id);
      
      // Buscar membros do projeto
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          role,
          profiles (
            id,
            email,
            full_name
          )
        `)
        .eq('project_id', projectId);
        
      if (memberError) throw memberError;
      
      // Formatar dados para exibição
      const formattedMembers = memberData.map(member => ({
        id: member.user_id,
        email: member.profiles.email,
        name: member.profiles.full_name || member.profiles.email,
        role: member.role as "admin" | "editor" | "viewer" // Casting para o tipo correto
      }));
      
      setMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros do projeto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  const updateMemberRole = async (memberId: string, newRole: "admin" | "editor" | "viewer") => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      // Atualizar a lista
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      
      toast({
        title: "Função atualizada",
        description: "A função do membro foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar função:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do membro.",
        variant: "destructive",
      });
    }
  };
  
  const removeMember = async (memberId: string) => {
    try {
      if (!confirm("Tem certeza que deseja remover este membro do projeto?")) {
        return;
      }
      
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      // Atualizar a lista
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Membro removido",
        description: "O membro foi removido do projeto com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro do projeto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Gerencie os membros e suas permissões no projeto
          </CardDescription>
        </div>
        {isOwnerOrAdmin && (
          <Button onClick={() => setShowInviteForm(!showInviteForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Convidar Membro
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showInviteForm && (
          <div className="mb-6">
            <InviteForm
              projectId={projectId}
              open={showInviteForm}
              onOpenChange={setShowInviteForm}
              onComplete={() => {
                fetchMembers();
              }}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Função</th>
                <th className="text-right py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center">Carregando...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum membro encontrado além do proprietário</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="py-3 px-4">{member.email}</td>
                    <td className="py-3 px-4">
                      {isOwnerOrAdmin ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: "admin" | "editor" | "viewer") => updateMemberRole(member.id, value)}
                          disabled={member.id === owner}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Funções</SelectLabel>
                              <SelectItem value="admin">
                                <div className="flex items-center">
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Administrador
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center">
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Editor
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center">
                                  <UserX className="mr-2 h-4 w-4" />
                                  Visualizador
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center">
                          {member.role === 'admin' && <UserCog className="mr-2 h-4 w-4" />}
                          {member.role === 'editor' && <UserCheck className="mr-2 h-4 w-4" />}
                          {member.role === 'viewer' && <UserX className="mr-2 h-4 w-4" />}
                          {member.role === 'admin' && 'Administrador'}
                          {member.role === 'editor' && 'Editor'}
                          {member.role === 'viewer' && 'Visualizador'}
                          {member.id === owner && ' (Proprietário)'}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isOwnerOrAdmin && member.id !== owner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <h3 className="font-medium mb-2">Sobre funções de projeto:</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex gap-2">
              <UserCog className="h-4 w-4" /> <strong>Administrador:</strong> Acesso completo - pode editar o projeto, gerenciar membros, criar, editar e excluir itens
            </li>
            <li className="flex gap-2">
              <UserCheck className="h-4 w-4" /> <strong>Editor:</strong> Pode criar e editar itens, mas não excluir nem gerenciar membros
            </li>
            <li className="flex gap-2">
              <UserX className="h-4 w-4" /> <strong>Visualizador:</strong> Pode apenas visualizar itens, sem permissão para editar
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
