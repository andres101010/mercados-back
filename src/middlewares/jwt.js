import jwt from 'jsonwebtoken'
const generateJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id };

        jwt.sign(
            payload,
            process.env.SECRET_JWT_SEED,
            {
                expiresIn: '1d',
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                resolve(token);
            },
        );
    });
};

export default generateJWT;