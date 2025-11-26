// Funções puras para cálculo de estoque (sem dependências)

// Calcular estoque baseado em array de movimentações
export const calculateStockFromMovements = (movements) => {
  let stock = 0;

  movements.forEach(movement => {
    if (movement.type === 'entry') {
      stock += movement.quantity;
    } else if (movement.type === 'exit') {
      stock -= movement.quantity;
    }
  });

  return stock;
};

// Verificar se precisa de reposição
// Considera estoque baixo quando: estoque <= 1 unidade OU estoque <= minStock
export const needsRestock = (currentStock, minStock) => {
  // Sempre considera estoque baixo se tiver 1 unidade ou menos
  if (currentStock <= 1) {
    return true;
  }
  // Também considera estoque baixo se atingir o minStock (quando minStock > 1)
  return currentStock <= (minStock || 0);
};

// Obter cor do status do estoque
export const getStockColor = (currentStock, minStock) => {
  // Considera estoque baixo se tiver 1 unidade ou menos, ou se atingir o minStock
  const isLowStock = currentStock <= 1 || currentStock <= (minStock || 0);
  
  if (isLowStock) {
    return '#e74c3c'; // Vermelho para estoque baixo
  } else if (currentStock <= (minStock * 1.5) || currentStock <= 2) {
    return '#f39c12'; // Amarelo para atenção (quando está próximo de 1 ou do minStock)
  } else {
    return '#2ecc71'; // Verde para normal
  }
};

// Obter texto do status
export const getStockStatus = (currentStock, minStock) => {
  // Considera estoque baixo se tiver 1 unidade ou menos, ou se atingir o minStock
  const isLowStock = currentStock <= 1 || currentStock <= (minStock || 0);
  
  if (isLowStock) {
    return 'ESTOQUE BAIXO';
  } else if (currentStock <= (minStock * 1.5) || currentStock <= 2) {
    return 'ATENÇÃO';
  } else {
    return 'NORMAL';
  }
};