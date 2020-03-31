package com.group.partitionprovider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import tk.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("com.group.partitionDao.dao")
public class PartitionProviderApplication {

	public static void main(String[] args) {
		SpringApplication.run(PartitionProviderApplication.class, args);
	}

}
