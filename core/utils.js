module.exports = {  
  englishJoinList(arr) {
    if (arr.length === 0) {
      return '';
    } else if (arr.length === 1) {
      return arr[0];
    } else {
      let result = '';
      arr.slice(0, -1).forEach((x) => {
        result += x + ", ";
      });
      result += "and " + arr[arr.length - 1];
      return result;
    }
  }
};