package com.elevatortwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RuleUpdateRequest {
    private String ruleKey;
    private Double thresholdValue;
    private String severity;
    private Boolean enabled;
}
