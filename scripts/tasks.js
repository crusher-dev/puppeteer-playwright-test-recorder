require('shelljs/global');

exports.copyAssets = (type) => {
    const env = type === 'build' ? 'prod' : type;
    rm('-rf', type);
    mkdir(type);
    cp(`src/manifest.${env}.json`, `${type}/manifest.json`);
    cp('-R', 'src/assets/*', type);
    exec(`pug -O "{ env: '${env}' }" -o ${type} src/templates/`);
};
