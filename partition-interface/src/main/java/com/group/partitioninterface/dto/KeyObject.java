package com.group.partitioninterface.dto;

import lombok.Data;

import java.security.interfaces.RSAPrivateKey;

@Data
public class KeyObject {
	private String modulus;
	private String publicExponent;
	private String privateExponent;
	private RSAPrivateKey privateKey;
}