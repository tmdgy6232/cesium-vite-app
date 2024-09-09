import axios from 'axios';

// 재사용 가능한 axios 요청 함수
export const apiRequest = async (method, url, data = null, headers = {}) => {
  try {
    const response = await axios({
      method: method,  // HTTP 메서드 (GET, POST, PUT, DELETE 등)
      url: url,        // 요청할 URL
      data: data,      // POST나 PUT 요청 시 보낼 데이터 (없으면 null)
      headers: headers // 필요한 헤더 정보
    });
    
    // 요청 성공 시 데이터를 반환
    return response.data;
  } catch (error) {
    // 에러가 발생할 경우 에러 메시지를 출력
    console.error('API 요청 오류:', error);
    throw error; // 필요에 따라 에러를 호출한 함수로 전달
  }
};
