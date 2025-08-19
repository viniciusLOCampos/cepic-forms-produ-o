import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const numeroRegistro = location.state?.numeroRegistro;
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-48 items-center justify-center">
            <img src="/lovable-uploads/a144fd59-95b1-4dcc-8d17-1fd7b5cd2e1d.png" alt="CEPIC Logo" className="h-auto w-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            Obrigado!
          </CardTitle>
          <CardDescription className="text-black">
            Você foi cadastrado com sucesso!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {numeroRegistro && <div className="text-center">
              <p className="text-lg font-medium text-black mb-2">Seu Código para todo período de evento é:</p>
              <p className="text-4xl font-bold text-red-600">
                {numeroRegistro}
              </p>
            </div>}
          
          <div className="mt-8 space-y-4">
            <p className="text-2xl font-bold text-black">
              Oportunidade!! Conheça nossos cursos !
            </p>
            <Button asChild className="px-8 py-4 h-14 text-white text-xl font-black hover:opacity-90 mx-auto block" style={{
            backgroundColor: '#FAA217'
          }}>
              <a href="https://raw.githubusercontent.com/viniciusLOCampos/Arquivos/277371604827ab4c982cf944a5e3da8e48f7ddcb/cepic_folder.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                Conhecer Cursos
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Success;