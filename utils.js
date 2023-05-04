const evaluatex = require('evaluatex');
const fs = require('fs');
const readline = require('readline');
const fsProm = require('fs/promises');

module.exports = {
    getRunnable: (raw_latex) => {
        return evaluatex(raw_latex, { latex: true });
    },

    getInput: async (filename) => {
        const fstream = fs.createReadStream(filename);

        const rinterface = readline.createInterface({
            input: fstream,
            crlfDelay: Infinity
        });

        const retval = [];
        let varNames = [];
        let nameline = true;

        for await (line of rinterface) {
            if (line.trim() == '') continue;

            if (nameline) {
                nameline = false;
                varNames = line.trim().split(',');
                continue;
            }

            const vars = line.trim().split(',');
            const config = {};

            for (let i = 0; i < varNames.length; i++) {
                config[varNames[i]] = vars[i];
            }

            retval.push(config);
        }

        return retval;
    },

    getOutput: async (raw_latex, input, filename) => {
        const outname = filename.replace('.csv', '') + '-out.csv';
        const runnable = module.exports.getRunnable(raw_latex);
        let results = ['results'];

        for (vars of input) {
            try {
                const curRes = runnable(vars);
                results.push(curRes);
            } catch (e) {
                return `Error at ${vars}: \n ${e}`
            }
        }

        const resData = results.join('\n');

        try {
            await fsProm.writeFile(outname, resData);
            return outname;
        } catch (e) {
            return `Error writing to file ${outname}: ${e}`
        }
    },

    cleanup: (filename) => {
        const outname = filename.replace('.csv', '') + '-out.csv';

        fs.unlink(filename, (e) => {
            if (e) {
                console.error(`Error deleting ${filename} - ${e}`);
            } else {
                fs.unlink(outname, (e) => {
                    if (e) {
                        console.error(`Error deleting ${outname} - ${e}`);
                    }
                });
            }
        });
    }
}
