export interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
  ativo: boolean;
}

export interface ProductInput {
  nome: string;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
}

export interface CartItem {
  produtoId: number;
  quantidade: number;
}
