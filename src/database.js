const { Sequelize } = require('sequelize');

   const sequelize = new Sequelize({
     dialect: 'sqlite',
     storage: './database.sqlite',
     logging: console.log // Isso vai logar as queries SQL
   });

   sequelize.authenticate()
     .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso.'))
     .catch(err => console.error('Não foi possível conectar ao banco de dados:', err));

     const Product = sequelize.define('Product', {
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      descricao: {
        type: Sequelize.TEXT
      },
      preco: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      imagens: {
        type: Sequelize.TEXT,
        get() {
          const value = this.getDataValue('imagens');
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue('imagens', JSON.stringify(value));
        }
      }
    });

module.exports = { sequelize, Product };