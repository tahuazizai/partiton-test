package com.group.partitionweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class PartitionWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(PartitionWebApplication.class, args);
	}

}
