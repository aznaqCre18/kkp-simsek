import { Sequelize } from 'sequelize';

const db = new Sequelize('sistem_sekolah', 'root', '', {
    host: "localhost",
    dialect: "mysql"
})

export default db;