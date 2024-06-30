
export const smoothing = 0.2;
/**
 * Permet de déterminer si le point est à la position 0,0 ou non
 * @param {Point} point : Le point en question
 * @return {boolean} : True si le point est en 0,0, False sinon.
 */
export const estPointAZero = (point) => {
    return (point.x === 0 && point.y === 0) ? true : false;
}

/**
 * Permet de calculer la distance entre deux points.
 * @param {Point} pointA : le premier point d'une ligne 
 * @param {Point} pointB : le deuxième point d'une ligne
 * @return {float} : la distance entre les deux points
 */
export const distanceBtw = (pointA, pointB) => {
    return Math.sqrt(Math.pow((pointA.x - pointB.x), 2) + Math.pow(pointA.y - pointB.y, 2));
}


/**
 * Permet de calculer la longeur et l'angle d'une ligne constituée des deux points fournis en paramètres
 * @param {Point} pointA  : Premier point
 * @param {Point} pointB  : Second point
 * @return {array} : [length,angle] : les informations sur la ligne.
 */
export const line = (pointA, pointB) =>{
    const lengthX = pointB.x - pointA.x
    const lengthY = pointB.y - pointA.y
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

/**
 *  Permet de calculer les coordonnées des points de controle.
 * @param {Point} current : Le point actuel
 * @param {Point} previous : Le point précédent
 * @param {Point} next : Le point suivant
 * @param {Boolean} reverse : [Optional] La direction du point de controle
 * @return {Point} : Les coordonnées du point de controle. 
 */
export const controlPoint = (current, previous, next, reverse) => {
    const smoothing = 0.2;
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const o = line(p, n);

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;

    // The control point position is relative to the current point
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;

    if (x < 20 && y < 20) {
        console.log("x = " + x + " y = " + y);
    }

    return [x, y];
}

/**
 * Permet de calculer la commande SVG pour un point précis dans une array de points.
 * @param {Point} point : Le point courant
 * @param {integer} i : L'index du 'point' dans l'array 'a'
 * @param {array} a : l'array des coordonnées des points.
 * @return {string} : la commande SVG bezier prêt à être mise dans l'html
 */
export const bezierCommand = (point, i, a) => {
    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point)

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point.x},${point.y}`
}

/**
 * Permet de calculer la commande SVG pour l'ensemble des points.
 * @param {array} points : L'array des points.
 * @param {function} command : La fonction à appliquer pour calculer les commandes SVG sur chaque points.
 */
export const svgPath = (points, command) => {
    // build the d attributes by looping over the points
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `M ${point.x},${point.y}`
        : `${acc} ${command(point, i, a)}`
        , '')
    return `${d}`
}