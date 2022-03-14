import Users from "../models/UserModels.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({attributes: ['name', 'email', 'role']});
        res.json({
            code: "200",
            status: "success",
            message: "Berhasil get data users",
            data: users
        });
    } catch (error) {
        console.log(error);
    }
}

export const addUser = async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;

    if(password !== confirmPassword) {
        return (
            res.status(400).json({
                code: "400",
                status: "failed",
                message: "Passowrd yang anda input tidak sama dengan confirm passowrd yang anda input"
            })
        )
    }

    const salt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash(password, salt);
    const userRole = role === 1 ? 'admin' : 'siswa';

    try {
        await Users.create({
            name,
            email,
            password: hashPass,
            role: userRole,
        });
        res.json({
            code: "200",
            status: "success",
            message: "Berhasil Tambah Data User",
            data: {
                name: name,
                email: email,
                role: userRole
            }
        })
    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) {
            return res.status(400).json({
                code: "401",
                status: "failed",
                message: "Wrong password",
            })
        }
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const role = user[0].role;
        const accessToken = jwt.sign({
            userId,
            name,
            email,
            role,
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });

        const refreshToken = jwt.sign({
            userId,
            name,
            email,
            role,
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        
        await Users.update({
            refresh_token: refreshToken
        }, {
            where: {
                id: userId,
            }
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // hanya jika di https
            // secure: true
        });

        res.status(200).json({
            code: "200",
            status: "success",
            message: "Berhasil Masuk",
            data: {
                id: userId,
                name: name,
                email: email,
                role: role,
                token: accessToken
            }
        });
    } catch (error) {
        res.status(404).json({
            code: "404",
            status: "failed",
            message: "Gagal login, email tidak ditemukan",
        })
    }
}