# Node.js Express Web

![Node](https://img.shields.io/badge/node-v14.17.1-blue)
![NPM](https://img.shields.io/badge/npm-v7.19.0-blue)

![Node.js](https://img.shields.io/badge/Node.js-339933.svg?&style=for-the-badge&logo=Node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000.svg?&style=for-the-badge&logo=Express&logoColor=white)
![Mysql](https://img.shields.io/badge/MySQL-4479A1.svg?&style=for-the-badge&logo=MySQL&logoColor=white)
![js](https://img.shields.io/badge/JavaScript-F7DF1E.svg?&style=for-the-badge&logo=JavaScript&logoColor=white)

>웹 프레임워크 Express를 사용한 웹 페이지 구현.  
데이터베이스에 있는 글 목록을 불러오고 출력하는 웹 페이지.  
글에 대한 CRUD 기능을 수행 가능.  

## 프로젝트 내용

* 데이터베이스에 저장되어 있는 글 제목들을 출력.
* 글에 대한 CRUD
    * 글 제목을 누르면 저장된 글 내용과 작성자가 출력.
    * Create를 통하여 새로운 글을 작성할 수 있음.
    * Update를 통하여 선택한 글을 수정할 수 있음.
    * delete를 통하여 선택한 글을 삭제할 수 있음.
    * Read를 제외한 기능은 전부 로그인한 이후 사용할 수 있음.
* SQL injection 방지를 위해, placeholder를 이용한 쿼리를 사용.
* XSS 방지를 위해 sanitized-html을 적용. 

## 설치 방법

```sh
npm install
```

## 개발 환경 설정
1. mysql을 설치하고 데이터베이스을 생성한다.  
2. 생성한 데이터베이스에 접근 가능하도록 /lib/db.template.js의 const db 항목을 입력한다.
3. db.template.js 파일의 파일명을 db.js로 변경한다.
4. author, topic 테이블을 생성한다.
    ```sql
    // author 테이블
    CREATE TABLE `author` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(20) NOT NULL,
        `profile` varchar(200) DEFAULT NULL,
        PRIMARY KEY (`id`)
    );

    // topic 테이블
    CREATE TABLE `topic` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(30) NOT NULL,
        `description` text,
        `created` datetime NOT NULL,
        `author_id` int(11) DEFAULT NULL,
        PRIMARY KEY (`id`)
    );
    ```
5. author 목록을 미리 생성한다.
    
    예시:
    ```sql
    INSERT INTO `author` VALUES (1,'AAA','developer');
    INSERT INTO `author` VALUES (2,'BBB','database administrator');
    INSERT INTO `author` VALUES (3,'CCC','data scientist');
    ```

## 사용 방법
## 추가 예정 기능