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
export const needsRestock = (currentStock, minStock) => {
  return currentStock <= minStock;
};

// Obter cor do status do estoque
export const getStockColor = (currentStock, minStock) => {
  if (currentStock <= minStock) {
    return '#e74c3c'; // Vermelho para estoque baixo
  } else if (currentStock <= (minStock * 1.5)) {
    return '#f39c12'; // Amarelo para atenção
  } else {
    return '#2ecc71'; // Verde para normal
  }
};

// Obter texto do status
export const getStockStatus = (currentStock, minStock) => {
  if (currentStock <= minStock) {
    return 'ESTOQUE BAIXO';
  } else if (currentStock <= (minStock * 1.5)) {
    return 'ATENÇÃO';
  } else {
    return 'NORMAL';
  }
};