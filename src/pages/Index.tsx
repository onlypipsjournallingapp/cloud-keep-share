
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/context/ThemeContext";

const Index = () => {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
};

export default Index;
