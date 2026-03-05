package com.venky.demo.aws;

import org.springframework.web.multipart.MultipartFile;

import java.net.URL;

public interface AWSS3Service {



    void deleteFile(String keyName);


    URL uploadFile(String keyName, MultipartFile file);
}
