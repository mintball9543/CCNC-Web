/**
 * 브라우저 번들용 빈 모듈.
 * hwp.js 가 사용하는 cfb 라이브러리는 Node 환경에서만 fs 를 쓰므로, 브라우저에서는 이 모듈로 대체한다.
 */
const empty = {};
export default empty;
