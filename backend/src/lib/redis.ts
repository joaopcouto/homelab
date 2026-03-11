import { createClient } from "redis";

export const redisClient = createClient({
  url: `${process.env.REDIS_CLIENT_URL}`,
});

redisClient.on("error", (err) => console.log("Erro no Redis Client", err));
redisClient.on("connect", () => console.log("🟢 Redis conectado com sucesso!"));
// Inicia a conexão
redisClient.connect().catch(console.error);

export const cacheService = {
  // Função para buscar
  async get(key: string) {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.error(`🚨 Erro ao buscar cache da chave ${key}:`, err);
      return null;
    }
  },
  // Função para salvar
  async set(key: string, value: any, expirationInSeconds: number = 60) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expirationInSeconds,
      });
    } catch (err) {
      console.error(`🚨 Erro ao salvar cache da chave ${key}:`, err);
    }
  },
  // Função para limpar cache quando algo for atualizado
  async delete(key: string) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error(`🚨 Erro ao deletar cache da chave ${key}:`, err);
    }
  },

  async pushToStack(key: string, value: any, expirationInSeconds: number = 300) {
    try {
      await redisClient.lPush(key, JSON.stringify(value));
      await redisClient.lTrim(key, 0, 4);
      await redisClient.expire(key, expirationInSeconds);
    } catch (err) {
      console.error(`🚨 Erro ao adicionar à pilha da chave ${key}:`, err);
    }
  },

  async popFromStack(key: string) {
    try {
      const data = await redisClient.lPop(key);
      if (!data) return null;
      return JSON.parse(data);gi
    } catch (err) {
      console.error(`🚨 Erro ao apagar cache da chave ${key}:`, err);
    }
  }
};
