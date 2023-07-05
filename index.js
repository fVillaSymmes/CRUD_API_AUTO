const http = require('http');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');



http.createServer(async (req,res) => {
    const { searchParams, pathname } = new URL(req.url, `http://${req.headers.host}`)
    const params = new URLSearchParams(searchParams)
    console.log(pathname); 

    const lecturaArchivo = await fs.readFile('autos.txt')
    const datosOriginales = JSON.parse(lecturaArchivo);
    const id = params.get("id");

    if(pathname == '/autos' && req.method == 'GET') {
        res.write(lecturaArchivo);
        res.end();
    }

    if(pathname == '/autos' && req.method == 'POST') {
        const identificacion = uuidv4()

        let datosAutos

        req.on('data', (data) => {
            datosAutos = JSON.parse(data);
        })

        req.on('end', async () => {
            datosOriginales[identificacion] = datosAutos;
            await fs.writeFile('autos.txt', JSON.stringify(datosOriginales, null, 2));
            res.write('Vehículo agregado exitosamente');
            res.end();
        })
    }

    if(pathname == '/autos' && req.method == 'PUT') {
        let datosParaModificar;

        req.on('data', (datos) => {
            datosParaModificar = JSON.parse(datos);
        })

        req.on('end', async () => {
            const autoPorModificar = datosOriginales[id]
            const autoModificado = {...autoPorModificar, ...datosParaModificar }

            datosOriginales[id] = autoModificado

            await fs.writeFile('autos.txt', JSON.stringify(datosOriginales, null, 2));

            res.write(JSON.stringify(autoModificado, null, 2));
            res.end();
        })
    }

    if(pathname == '/autos' && req.method == 'DELETE') {

        delete datosOriginales[id];
        await fs.writeFile('autos.txt', JSON.stringify(datosOriginales, null, 2));
        res.write('El auto ha sido eliminado satisfactoriamente');
        res.end()
    }

})
.listen(3000, function() {
    console.log("Servidor iniciado en el puerto 3000");
})