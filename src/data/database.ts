import * as SQLite from 'expo-sqlite';

// Função para abrir ou criar o banco de dados
const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('mydb.db', {
      useNewConnection: true
    });

    // Cria a tabela se não existir
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  
        company TEXT,
        hours TEXT,
        hours_exit TEXT,
        hours_total TEXT,
        jornade TEXT,
        date TEXT,
        status TEXT,
        local TEXT
      );
    `);


    return db;
  } catch (error) {
    //console.error('Erro ao abrir o banco de dados:', error);
    throw error; // Re-throw error to ensure it is handled properly elsewhere
  }
};

// Função para inserir um cartão
export const insertCard = async (company: string, hours: string, hours_exit:string ,hours_total: string, jornade:string, date: string, status: string , local:string) => {
  try {
    const db = await openDatabase();
    await db.runAsync('INSERT INTO cards (company, hours, hours_exit, hours_total, jornade , date, status,local) VALUES (?, ?, ?, ?, ? ,? ,?,?)', [company, hours, hours_exit, hours_total,jornade, date, status,local]);
    //console.log('Cartão inserido com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir cartão:', error);
  }
};

// Função para obter todos os cartões
export const getCards = async (callback: (cards: Card[]) => void) => {
  try {
    const db = await openDatabase();
    const cards = await db.getAllAsync('SELECT * FROM cards');
    
    callback(cards as Card[]);
  } catch (error) {
    console.error('Erro ao obter cartões:', error);
  }
};

// Função para deletar todos os cartões
export const deleteAllCards = async () => {
  try {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM cards');
    //console.log('Todos os cartões deletados com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar cartões:', error);
  }
};

export const deleteTable = async () => {
  try {
    const db = await openDatabase();
    await db.runAsync('DROP TABLE IF EXISTS cards');

    //console.log('Tabela de cartões deletada com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar a tabela de cartões:', error);
  }
};


export const updateCardStatus = async (cardId:number, hours_exit:string , newStatus :string , hours_total:any) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      'UPDATE cards SET status = ? , hours_exit = ? , hours_total = ? WHERE id = ?', 
      [newStatus, hours_exit, hours_total , cardId]
    );
 
    //console.log(`Status do cartão ${cardId} atualizado para ${newStatus} com sucesso!`);
  } catch (error) {
    console.error('Erro ao atualizar o status do cartão:', error);
  }
}; 


// Função para buscar cartões por data ou empresa
export const searchCards = async (searchQuery: string, callback: (cards: Card[]) => void) => {
  try {
    const db = await openDatabase();
    
    // Utiliza uma consulta SQL para buscar cartões com a data ou empresa correspondente
    const result = await db.getAllAsync(
      'SELECT * FROM cards WHERE date LIKE ? OR company LIKE ?', 
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    
    callback(result as Card[]);
  } catch (error) {
    console.error('Erro ao buscar cartões por data ou empresa:', error);
  }
};



// Definição da interface Card
interface Card {
  id: number;

  company: string;
  hours: string;
  hours_exit: string;
  hours_total: string;
  jornade:string,
  date: string;
  status: string;
  local:string;
}
