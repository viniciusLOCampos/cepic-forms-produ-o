import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { FormInput } from "./FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  validateCPF, 
  formatCPF, 
  formatPhone, 
  validatePhone, 
  validateEmail,
  checkCPFExists,
  getNextNumeroSorteio
} from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  celular: z.string().refine(validatePhone, "Celular deve ter formato válido (DDD + número)"),
  email: z.string().refine(validateEmail, "Email deve terminar com .com ou .empresa"),
  cpf: z.string().refine(validateCPF, "CPF inválido")
});

type FormData = z.infer<typeof formSchema>;

export const UserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Verificação final do CPF
      const cleanCPF = data.cpf.replace(/\D/g, '');
      
      const cpfExists = await checkCPFExists(cleanCPF);
      
      if (cpfExists) {
        toast({
          title: "Erro",
          description: "Este CPF já está cadastrado no sistema.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Gerar número de sorteio
      const numeroSorteio = await getNextNumeroSorteio();

      // Salvar dados na tabela formulario_cepic
      const { error: insertError } = await supabase
        .from('formulario_cepic')
        .insert({
          nome: data.nome,
          email: data.email,
          cpf: parseInt(cleanCPF),
          celular: parseInt(data.celular.replace(/\D/g, '')),
          numero_registro: numeroSorteio
        });

      if (insertError) {
        throw insertError;
      }

      // Redirecionar para página de sucesso com número de registro
      navigate('/sucesso', { state: { numeroRegistro: numeroSorteio } });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-20 w-48 items-center justify-center">
            <img 
              src="/lovable-uploads/a144fd59-95b1-4dcc-8d17-1fd7b5cd2e1d.png" 
              alt="CEPIC Logo" 
              className="h-auto w-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Cadastro de Usuário
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Preencha os dados abaixo para se cadastrar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              {...register("nome")}
              id="nome"
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              error={errors.nome?.message}
            />

            <FormInput
              {...register("celular")}
              id="celular"
              label="Celular"
              placeholder="(11) 99999-9999"
              mask={formatPhone}
              error={errors.celular?.message}
            />

            <FormInput
              {...register("email")}
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
            />

            <FormInput
              {...register("cpf")}
              id="cpf"
              label="CPF"
              placeholder="000.000.000-00"
              mask={formatCPF}
              error={errors.cpf?.message}
            />

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};