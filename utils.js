const evaluatex = require('evaluatex');

module.exports = {
    getRunnable: (raw_latex) => {
        return evaluatex(raw_latex, { latex: true });
    },
}
