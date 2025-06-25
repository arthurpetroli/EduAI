import sqlite3

def corrigir_tipos_exercicios():
    try:
        conn = sqlite3.connect('bank.db')
        cursor = conn.cursor()
        # Buscar todos os exercícios e avaliações
        cursor.execute("SELECT id, titulo FROM avaliacoes")
        itens = cursor.fetchall()
        
        print(f"Encontrados {len(itens)} itens na tabela 'avaliacoes'")
        
        # Atualizar tipo baseado no título
        for item_id, titulo in itens:
            if titulo and ("Exercício" in titulo or "Exercicios" in titulo or "exercício" in titulo or "exercicios" in titulo):
                cursor.execute("UPDATE avaliacoes SET tipo = 'exercicio' WHERE id = ?", (item_id,))
                print(f"Item {item_id} ({titulo}) atualizado para tipo 'exercicio'")
            else:
                cursor.execute("UPDATE avaliacoes SET tipo = 'avaliacao' WHERE id = ?", (item_id,))
                print(f"Item {item_id} ({titulo}) atualizado para tipo 'avaliacao'")
        
        conn.commit()
        conn.close()
        
        print("Operação concluída com sucesso!")
        return True
    except Exception as e:
        print(f"Erro ao corrigir tipos: {str(e)}")
        return False

if __name__ == "__main__":
    corrigir_tipos_exercicios()