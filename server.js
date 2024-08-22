const express = require('express');
const cors = require('cors');
const { sequelize, Product } = require('./src/database');
const { upload, processImage } = require('./src/middleware/imageUpload');
const fs = require('fs');
const { Op } = require('sequelize');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));

// Verificar e criar o diretório de uploads se não existir
const uploadsDir = './public/uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sincronizando o modelo com o banco de dados
sequelize.sync().then(() => {
  console.log('Banco de dados sincronizado');
}).catch(err => {
  console.error('Erro ao sincronizar o banco de dados:', err);
});

// Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { nome: { [Op.like]: `%${search}%` } },
              { descricao: { [Op.like]: `%${search}%` } },
              { codigo: { [Op.like]: `%${search}%` } }
            ]
          },
          { preco: { [Op.between]: [minPrice, maxPrice] } }
        ]
      },
      limit,
      offset
    });

    res.json({
      total: count,
      products: rows
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro ao listar produtos', error: error.message });
  }
});

// Buscar um produto específico
app.get('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Product.findByPk(id);
    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
});

// Criar um novo produto
app.post('/api/produtos', async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    const produto = await Product.create(req.body);
    console.log('Produto criado:', produto);
    res.json(produto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
});

// Atualizar um produto
app.put('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { imagens, ...otherData } = req.body;
    
    const [updated] = await Product.update(otherData, { where: { id } });
    if (updated) {
      const updatedProduct = await Product.findByPk(id);
      
      // Atualizar as imagens
      if (imagens !== undefined) {
        updatedProduct.imagens = imagens;
        await updatedProduct.save();
      }
      
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
});

// Deletar um produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: 'Produto deletado com sucesso' });
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
  }
});

// Rota para upload de imagens
app.post('/api/produtos/:id/imagens', upload.array('imagens', 6), async (req, res) => {
  try {
    console.log('Recebendo upload de imagens para o produto:', req.params.id);
    console.log('Arquivos recebidos:', req.files);

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (!req.files || req.files.length === 0) {
      // Se nenhuma imagem foi enviada, apenas retorne as imagens atuais
      return res.json({ imagens: product.imagens || [] });
    }

    const imagePromises = req.files.map(processImage);
    const imageFilenames = await Promise.all(imagePromises);

    console.log('Nomes dos arquivos processados:', imageFilenames);

    const currentImages = product.imagens || [];
    const updatedImages = [...currentImages, ...imageFilenames].slice(0, 6);

    console.log('Imagens atualizadas:', updatedImages);

    await product.update({ imagens: updatedImages });

    res.json({ imagens: updatedImages });
  } catch (error) {
    console.error('Erro detalhado ao fazer upload de imagens:', error);
    res.status(500).json({ message: 'Erro ao fazer upload de imagens', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
