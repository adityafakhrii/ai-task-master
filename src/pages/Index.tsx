import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ListTodo, Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/todos');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Welcome to Todo App</h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Manage your tasks efficiently with a beautiful interface and smart features
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg bg-card border">
            <ListTodo className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Organize Tasks</h3>
            <p className="text-sm text-muted-foreground">Create, update, and manage your todos with ease</p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">Mark tasks complete and stay on top of your goals</p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Set Priorities</h3>
            <p className="text-sm text-muted-foreground">Categorize and prioritize your tasks effectively</p>
          </div>
        </div>

        <Button onClick={() => navigate('/auth')} size="lg" className="mt-8">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
