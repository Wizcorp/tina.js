/**
 *
 * Maps the given properties to a unit type
 *
 * Currently only supports basic CSS methods - in order to support more advance CSS3 properties, such as
 * transform, we will need to modify the way the properties array is handled and moved through the system. 
 * In the case of CSS methods such as "transform: rotate(Xdeg)" - the mapping will need to be more advanced,
 * possibly adding a prefix / suffix mapping.
 *
 * @param {array}  properties - Properties of the object to tween
 * @returns {array} - The suffix mapped to the property name
 *
 */
module.exports = function (properties) {
    
        var cssMap = { height: 'px', width: 'px', top: 'px', left: 'px', bottom: 'px', right: 'px', opacity: '' };
        var mapping = {};
    
        for (var i = 0; i < properties.length; i++) {
                if (properties[i] in cssMap) {
                        var property = properties[i];
                        mapping[property] = cssMap[property];
                }
        }
    
        return mapping;
};
