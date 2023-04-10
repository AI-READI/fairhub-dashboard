/*
Imports
*/

import * as D3 from "d3";

/*
Kernel Functions
*/

class Kernel {

  // References
  smoothing = undefined;

  constructor (config) {

    let self = this;

    // Configure Kernel
    self.method    = config.method;
    self.smoothing = config.smoothing;
    self.apply     = self.call(self.method);

    return self;

  }

  /*
  Kernels
  */

  // Epanechnikov Kernel
  epanechnikov_kernel (x, y, smoothing) {
    let self = this;
    let v = x - y;
    return Math.abs(v /= smoothing) <= 1 ? 0.75 * (1 - v * v) / smoothing : 0;
  }

  /*
  Helpers
  */

  call (method) {
    let self = this;
    let name = `${self.method}_kernel`
    let kernel = self[name];
    return function (X, Y) {
      console.log(X, Y);
      let K = [];
      X.forEach((x, i) => {
        K.push([
          x,
          D3.mean(Y, function (y) { return kernel(X[i], y, self.smoothing); })
        ]);
      });
      return K;
    }
  }

  list () {
    let self = this;
    let kernels = new Set();
    while (self = Reflect.getPrototypeOf(self)) {
      let methods = Reflect.ownKeys(self);
      methods.forEach(method => {
        if (method.includes("_kernel")) {
          kernels.add(method.replace("_kernel", ""));
        }
      });
    }
    console.info(kernels);
    return kernels;
  }

}

/*
Params

k = 7
bw = 40

*/

//   // Compute kernel density estimation
//   var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
//   var density =  kde( data.map(function(d){  return d.price; }) )

// // Function to compute density
// function kernelDensityEstimator(kernel, X) {
//   return function(V) {
//     return X.map(function(x) {
//       return [x, d3.mean(V, function(v) { return kernel(x - v); })];
//     });
//   };
// }
// function kernelEpanechnikov(k) {
//   return function(v) {
//     return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
//   };
// }

export default Kernel;
