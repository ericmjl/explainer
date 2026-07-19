export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/genie2.yaml": "d5fbf1c1a91ef74dcef47388855e83b7e5571deb7d63a5eb2657177355c2f96a",
      "views/genie2-semantic-zoom.view.yaml": "8b8fe70a2866cad0051913e38e4d2a5b0fef68b0aeb14127c4d27eb36d353158",
      "pseudocode/genie2.yaml": "b78ca953f8ebed98a688501d7485e3b2e79fb50b2e9434d876012c1ee4289bd0",
      "standard_blocks/invariant-point-attention.yaml": "a88d3bd473e6bbfeb6846085f7d5091e6e8b0e33fbbd8292af4d578df22b2c27"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "genie2",
    "name": "Genie 2 Protein Backbone Diffusion",
    "family": "protein_structure_diffusion",
    "status": "draft",
    "taskModes": [
      "unconditional_backbone_generation",
      "motif_scaffolding"
    ],
    "referenceConfiguration": {
      "checkpoint": "base",
      "diffusion_steps": 1000,
      "single_feature_dimension": 384,
      "pair_feature_dimension": 128,
      "pair_transform_layers": 5,
      "triangular_multiplicative_update": true,
      "triangular_attention": false,
      "structure_layers": 8,
      "structure_recycles": 1,
      "ipa_heads": 12,
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_config_code",
            "role": "implementation_evidence",
            "locator": "Config._create_config",
            "note": "The default model and diffusion dimensions define the released base architecture."
          },
          {
            "source_ref": "genie2_base_config",
            "role": "checkpoint_configuration",
            "locator": "full file",
            "note": "The released base checkpoint retains five pair-transform layers and uses motif-conditioned training examples."
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/genie2.yaml",
    "sources": [
      {
        "source_ref": "genie2_2024",
        "role": "architecture_description"
      },
      {
        "source_ref": "genie2_model_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "genie2_sampler_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "genie2_training_code",
        "role": "training_implementation"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_sampler_code",
            "role": "implementation_evidence",
            "locator": "BaseSampler.sample and BaseSampler._sample",
            "note": "Feature construction, reverse diffusion, and output postprocessing form the complete generation path represented at the task boundary."
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.feature_builder",
            "modules.reverse_diffusion_sampler",
            "modules.pdb_exporter"
          ]
        },
        "modules.feature_builder": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.reverse_diffusion_sampler": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 6,
          "immediateModuleRefs": [
            "modules.coordinate_initializer",
            "modules.timestep_controller",
            "modules.frenet_frame_builder",
            "modules.denoiser",
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ]
        },
        "modules.pdb_exporter": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.coordinate_initializer": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.timestep_controller": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.frenet_frame_builder": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.denoiser": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.invariant_feature_encoder",
            "modules.equivariant_structure_decoder",
            "modules.noise_readout"
          ]
        },
        "modules.step_noise_sampler": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.reverse_diffusion_update": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.invariant_feature_encoder": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.single_feature_net",
            "modules.pair_feature_net",
            "modules.pair_transform_stack"
          ]
        },
        "modules.equivariant_structure_decoder": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.invariant_point_attention",
            "modules.structure_transition",
            "modules.backbone_update"
          ]
        },
        "modules.noise_readout": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_feature_net": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_feature_net": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transform_stack": {
          "status": "complete",
          "depth": 4,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_transition"
          ]
        },
        "modules.triangle_multiplication_outgoing": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.triangle_multiplication_incoming": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transition": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.invariant_point_attention": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_transition": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.backbone_update": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 22,
        "expandedScopeCount": 6,
        "completeExpandedScopeCount": 6,
        "partialScopeCount": 0,
        "leafFrontierCount": 16,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 0,
        "maximumAuthoredDepth": 5
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [

      ]
    },
    "modules": [
      {
        "id": "feature_builder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Sampling Feature Builder",
        "kind": "adapter",
        "mechanisms": [
          "task_featurization"
        ],
        "role": "turn a target length or motif PDB specification into residue layout, masks, and optional motif sequence and geometry constraints",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_sampler",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Genie 2 Reverse Diffusion",
        "kind": "sampler",
        "mechanisms": [
          "reverse_diffusion",
          "ddpm"
        ],
        "role": "initialize random C-alpha coordinates and run all 1000 denoising and posterior-update steps",
        "scale": "residue",
        "repeats": 1000,
        "pseudocode_ref": "../../pseudocode/genie2.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "pdb_exporter",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Backbone PDB Exporter",
        "kind": "serializer",
        "role": "write generated C-alpha coordinates as a sequence-agnostic backbone PDB and, for scaffolding, a residue-aligned motif PDB",
        "scale": "output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      },
      {
        "id": "coordinate_initializer",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Gaussian Coordinate Initializer",
        "kind": "sampler",
        "mechanisms": [
          "gaussian_initialization"
        ],
        "role": "sample standard-normal C-alpha coordinates with the requested residue count",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_controller",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Reverse Timestep Controller",
        "kind": "controller",
        "mechanisms": [
          "timestep_schedule"
        ],
        "role": "enumerate diffusion steps from 1000 down to 1",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "frenet_frame_builder",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Frenet Frame Construction",
        "kind": "adapter",
        "mechanisms": [
          "frenet_frames"
        ],
        "role": "derive residue rotations from the current C-alpha trace and package them with the unchanged x_t translations for the denoiser",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "denoiser",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Equivariant Denoiser",
        "kind": "denoiser",
        "role": "map the current C-alpha trace packaged with its derived Frenet frames, timestep, and optional motif constraints to a per-residue noise prediction",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "step_noise_sampler",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Step Noise Sampler",
        "kind": "sampler",
        "mechanisms": [
          "gaussian_noise"
        ],
        "role": "draw fresh Gaussian translation noise for every nonfinal reverse step",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_update",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "DDPM Coordinate Update",
        "kind": "operator",
        "mechanisms": [
          "ddpm"
        ],
        "role": "combine current C-alpha coordinates, predicted noise, schedule coefficients, and fresh noise into the next C-alpha coordinates",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "invariant_feature_encoder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Invariant Feature Encoder",
        "kind": "encoder",
        "mechanisms": [
          "invariant_geometry"
        ],
        "role": "construct and refine residue and residue-pair states from indices, noisy-frame geometry, timestep, and optional motif constraints",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "equivariant_structure_decoder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Equivariant Structure Decoder",
        "kind": "refiner",
        "mechanisms": [
          "invariant_point_attention",
          "rigid_transform"
        ],
        "role": "use invariant point attention to update single features and compose learned rigid increments into the noisy residue frames",
        "scale": "residue",
        "repeats": 8,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "noise_readout",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Translation Displacement Readout",
        "kind": "operator",
        "mechanisms": [
          "vector_difference"
        ],
        "role": "subtract updated translations from the input noisy translations to obtain the predicted diffusion noise",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "single_feature_net",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single-Feature Network",
        "kind": "encoder",
        "role": "concatenate residue, chain, timestep, motif-sequence, and mask encodings and project them to 384-dimensional per-residue features",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_feature_net",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair-Feature Network",
        "kind": "encoder",
        "role": "combine the single-feature outer sum, relative positions, noisy-frame distances and orientations, and masked motif distances into 128-dimensional pair features",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transform_stack",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pair Transform Stack",
        "kind": "refiner",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "refine pair features through five residual layers of outgoing and incoming triangular multiplication followed by pair transition",
        "scale": "pair",
        "repeats": 5,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformNet and PairTransformLayer"
            },
            {
              "source_ref": "genie2_config_code",
              "role": "configuration_evidence",
              "locator": "Config._create_config"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_outgoing",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Outgoing",
        "kind": "operator",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "update each pair edge through outgoing two-edge paths and add the row-dropout result residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_incoming",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Incoming",
        "kind": "operator",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "update each pair edge through incoming two-edge paths and add the row-dropout result residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair Transition",
        "kind": "feed_forward",
        "role": "apply a pair-wise transition MLP and add its output residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "invariant_point_attention",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Invariant Point Attention",
        "kind": "attention",
        "mechanisms": [
          "invariant_point_attention"
        ],
        "role": "update the single state using single features, pair features, and query/key/value points expressed in current residue frames",
        "scale": "residue",
        "attention": {
          "pattern": "full",
          "query_scale": "residue",
          "key_value_scale": "residue",
          "heads": 12,
          "pair_bias": true,
          "pair_bias_source": "refined_pair_features",
          "positional_encoding": {
            "kind": "rigid_frame_points"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "structure_transition",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Structure Transition",
        "kind": "feed_forward",
        "role": "normalize and transform the IPA-updated per-residue single state",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "backbone_update",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Backbone Frame Update",
        "kind": "operator",
        "mechanisms": [
          "rigid_transform"
        ],
        "role": "project each residue state to a six-parameter rigid increment and compose it into the current frame",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      }
    ],
    "blockInstances": [
      {
        "id": "structure_ipa",
        "standardBlockId": "invariant_point_attention",
        "standardBlockRef": "standard_blocks/invariant-point-attention.yaml",
        "standardBlockName": "Invariant Point Attention",
        "subjectRef": "modules.invariant_point_attention",
        "variant": "full_ipa_residual_norm",
        "variantLabel": "Full IPA + residual normalization",
        "variantDescription": "Full scalar, point, and pair aggregation followed by the StructureLayer residual, dropout, and LayerNorm wrapper.",
        "useScope": "whole_module",
        "conformance": "exact",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_ipa_code",
              "role": "implementation_evidence",
              "locator": "InvariantPointAttention.forward",
              "note": "The IPA module implements scalar, point, pair-bias, and pair-value attention terms."
            },
            {
              "source_ref": "genie2_structure_code",
              "role": "wrapper_evidence",
              "locator": "StructureLayer.forward",
              "note": "The structure layer applies the residual, dropout, and LayerNorm wrapper represented by this variant."
            }
          ]
        },
        "portBindings": [
          {
            "portRef": "ports.single_state",
            "relationRefs": [
              "relations.single_features_enter_ipa"
            ],
            "relations": [
              {
                "relationRef": "relations.single_features_enter_ipa",
                "from": "value_sites.single_features",
                "to": "modules.invariant_point_attention",
                "kind": "data_flow",
                "operation": "attend_from_single_state",
                "carries": [
                  "representations.single_features"
                ]
              }
            ]
          },
          {
            "portRef": "ports.pair_context",
            "relationRefs": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "relations": [
              {
                "relationRef": "relations.refined_pair_features_bias_ipa",
                "from": "value_sites.refined_pair_features",
                "to": "modules.invariant_point_attention",
                "kind": "conditioning",
                "operation": "pair_conditioned_attention",
                "carries": [
                  "representations.pair_features"
                ]
              }
            ]
          },
          {
            "portRef": "ports.frames",
            "relationRefs": [
              "relations.current_frames_condition_ipa"
            ],
            "relations": [
              {
                "relationRef": "relations.current_frames_condition_ipa",
                "from": "value_sites.current_frames",
                "to": "modules.invariant_point_attention",
                "kind": "conditioning",
                "operation": "express_attention_points_in_frames",
                "carries": [
                  "representations.residue_frames"
                ]
              }
            ]
          },
          {
            "portRef": "ports.mask",
            "relationRefs": [
              "relations.feature_bundle_masks_ipa"
            ],
            "selector": "residue_mask",
            "relations": [
              {
                "relationRef": "relations.feature_bundle_masks_ipa",
                "from": "value_sites.feature_bundle",
                "to": "modules.invariant_point_attention",
                "kind": "conditioning",
                "operation": "mask_padded_residues",
                "carries": [
                  "representations.feature_bundle"
                ]
              }
            ]
          },
          {
            "portRef": "ports.updated_single_state",
            "relationRefs": [
              "relations.ipa_produces_updated_single_state"
            ],
            "relations": [
              {
                "relationRef": "relations.ipa_produces_updated_single_state",
                "from": "modules.invariant_point_attention",
                "to": "value_sites.single_after_ipa",
                "kind": "state_update",
                "operation": "residual_attention_update",
                "carries": [
                  "representations.single_features"
                ]
              }
            ]
          }
        ],
        "pseudocode": [
          {
            "id": "project_scalar_terms",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_scalar_terms",
            "label": "Project scalar Q/K/V",
            "operation": "scalar_qkv_projection",
            "code": "q_s, k_s, v_s = project_scalar_qkv(single_state)",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.scalar_terms"
            ],
            "codeBindings": [
              {
                "lexeme": "q_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 3
                  }
                ]
              },
              {
                "lexeme": "k_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 5,
                    "end": 8
                  }
                ]
              },
              {
                "lexeme": "v_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 10,
                    "end": 13
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 35,
                    "end": 47
                  }
                ]
              }
            ]
          },
          {
            "id": "project_local_points",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_local_points",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_local_points",
            "label": "Project local Q/K/V points",
            "operation": "point_qkv_projection",
            "code": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.local_points"
            ],
            "codeBindings": [
              {
                "lexeme": "q_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "k_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 11,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "v_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 22,
                    "end": 31
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 52,
                    "end": 64
                  }
                ]
              }
            ]
          },
          {
            "id": "transform_points_to_global",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instanceFactRef": "block_instances.structure_ipa.steps.transform_points_to_global",
            "label": "Express points in global frame",
            "operation": "rigid_apply",
            "code": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)",
            "inputs": [
              "values.local_points",
              "ports.frames"
            ],
            "outputs": [
              "values.global_points"
            ],
            "codeBindings": [
              {
                "lexeme": "q_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 10
                  }
                ]
              },
              {
                "lexeme": "k_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 12,
                    "end": 22
                  }
                ]
              },
              {
                "lexeme": "v_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 24,
                    "end": 34
                  }
                ]
              },
              {
                "lexeme": "frames",
                "access": "read",
                "localRef": "ports.frames",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.frames",
                "instanceFactRef": "block_instances.structure_ipa.ports.frames",
                "occurrences": [
                  {
                    "start": 37,
                    "end": 43
                  }
                ]
              },
              {
                "lexeme": "q_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 50,
                    "end": 59
                  }
                ]
              },
              {
                "lexeme": "k_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 61,
                    "end": 70
                  }
                ]
              },
              {
                "lexeme": "v_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 72,
                    "end": 81
                  }
                ]
              }
            ]
          },
          {
            "id": "scalar_attention_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.scalar_attention_logits",
            "label": "Form scalar logits",
            "operation": "attention_logits",
            "code": "scalar_logits = dot(q_s, k_s) * scalar_scale",
            "inputs": [
              "values.scalar_terms"
            ],
            "outputs": [
              "values.scalar_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "scalar_logits",
                "access": "write",
                "localRef": "values.scalar_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 13
                  }
                ]
              },
              {
                "lexeme": "q_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 20,
                    "end": 23
                  }
                ]
              },
              {
                "lexeme": "k_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 25,
                    "end": 28
                  }
                ]
              }
            ]
          },
          {
            "id": "point_distance_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.point_distance_logits",
            "label": "Form point-distance logits",
            "operation": "invariant_point_distance",
            "code": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)",
            "inputs": [
              "values.global_points"
            ],
            "outputs": [
              "values.point_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "point_logits",
                "access": "write",
                "localRef": "values.point_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.point_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.point_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 12
                  }
                ]
              },
              {
                "lexeme": "q_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 54,
                    "end": 64
                  }
                ]
              },
              {
                "lexeme": "k_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 66,
                    "end": 76
                  }
                ]
              }
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = linear_b(pair_context)",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ],
            "codeBindings": [
              {
                "lexeme": "pair_bias",
                "access": "write",
                "localRef": "values.pair_bias",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_bias",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_bias",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "pair_context",
                "access": "read",
                "localRef": "ports.pair_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.pair_context",
                "instanceFactRef": "block_instances.structure_ipa.ports.pair_context",
                "occurrences": [
                  {
                    "start": 21,
                    "end": 33
                  }
                ]
              }
            ]
          },
          {
            "id": "combine_and_mask_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "label": "Combine logits and apply mask",
            "operation": "ipa_logit_composition",
            "code": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)",
            "inputs": [
              "values.scalar_logits",
              "values.point_logits",
              "values.pair_bias",
              "ports.mask"
            ],
            "outputs": [
              "values.combined_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "combined_logits",
                "access": "write",
                "localRef": "values.combined_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.combined_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.combined_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 15
                  }
                ]
              },
              {
                "lexeme": "scalar_logits",
                "access": "read",
                "localRef": "values.scalar_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_logits",
                "occurrences": [
                  {
                    "start": 29,
                    "end": 42
                  }
                ]
              },
              {
                "lexeme": "point_logits",
                "access": "read",
                "localRef": "values.point_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.point_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.point_logits",
                "occurrences": [
                  {
                    "start": 45,
                    "end": 57
                  }
                ]
              },
              {
                "lexeme": "pair_bias",
                "access": "read",
                "localRef": "values.pair_bias",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_bias",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_bias",
                "occurrences": [
                  {
                    "start": 60,
                    "end": 69
                  }
                ]
              },
              {
                "lexeme": "mask",
                "access": "read",
                "localRef": "ports.mask",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.mask",
                "instanceFactRef": "block_instances.structure_ipa.ports.mask",
                "occurrences": [
                  {
                    "start": 71,
                    "end": 75
                  }
                ]
              }
            ]
          },
          {
            "id": "softmax_attention",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.softmax_attention",
            "instanceFactRef": "block_instances.structure_ipa.steps.softmax_attention",
            "label": "Normalize over keys",
            "operation": "softmax",
            "code": "attention = softmax(combined_logits, dim=keys)",
            "inputs": [
              "values.combined_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ],
            "codeBindings": [
              {
                "lexeme": "attention",
                "access": "write",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "combined_logits",
                "access": "read",
                "localRef": "values.combined_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.combined_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.combined_logits",
                "occurrences": [
                  {
                    "start": 20,
                    "end": 35
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = weighted_sum(attention, v_s)",
            "inputs": [
              "values.attention_weights",
              "values.scalar_terms"
            ],
            "outputs": [
              "values.scalar_context"
            ],
            "codeBindings": [
              {
                "lexeme": "scalar_context",
                "access": "write",
                "localRef": "values.scalar_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_context",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 14
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 30,
                    "end": 39
                  }
                ]
              },
              {
                "lexeme": "v_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 41,
                    "end": 44
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_global_points",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_global_points",
            "label": "Aggregate value points",
            "operation": "weighted_point_sum",
            "code": "global_point_context = weighted_sum(attention, v_p_global)",
            "inputs": [
              "values.attention_weights",
              "values.global_points"
            ],
            "outputs": [
              "values.global_point_context"
            ],
            "codeBindings": [
              {
                "lexeme": "global_point_context",
                "access": "write",
                "localRef": "values.global_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.global_point_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 36,
                    "end": 45
                  }
                ]
              },
              {
                "lexeme": "v_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 47,
                    "end": 57
                  }
                ]
              }
            ]
          },
          {
            "id": "return_points_to_local_frame",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instanceFactRef": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "label": "Return points to query frame",
            "operation": "rigid_inverse_apply",
            "code": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))",
            "inputs": [
              "values.global_point_context",
              "ports.frames"
            ],
            "outputs": [
              "values.local_point_context"
            ],
            "codeBindings": [
              {
                "lexeme": "local_point_context",
                "access": "write",
                "localRef": "values.local_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.local_point_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 19
                  }
                ]
              },
              {
                "lexeme": "frames",
                "access": "read",
                "localRef": "ports.frames",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.frames",
                "instanceFactRef": "block_instances.structure_ipa.ports.frames",
                "occurrences": [
                  {
                    "start": 29,
                    "end": 35
                  }
                ]
              },
              {
                "lexeme": "global_point_context",
                "access": "read",
                "localRef": "values.global_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.global_point_context",
                "occurrences": [
                  {
                    "start": 49,
                    "end": 69
                  },
                  {
                    "start": 84,
                    "end": 104
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_pair_values",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "label": "Aggregate pair values",
            "operation": "pair_value_aggregation",
            "code": "pair_value_context = weighted_sum(attention, pair_context)",
            "inputs": [
              "values.attention_weights",
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_value_context"
            ],
            "codeBindings": [
              {
                "lexeme": "pair_value_context",
                "access": "write",
                "localRef": "values.pair_value_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_value_context",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_value_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 18
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 34,
                    "end": 43
                  }
                ]
              },
              {
                "lexeme": "pair_context",
                "access": "read",
                "localRef": "ports.pair_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.pair_context",
                "instanceFactRef": "block_instances.structure_ipa.ports.pair_context",
                "occurrences": [
                  {
                    "start": 45,
                    "end": 57
                  }
                ]
              }
            ]
          },
          {
            "id": "project_ipa_delta",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_ipa_delta",
            "label": "Fuse IPA outputs",
            "operation": "output_projection",
            "code": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))",
            "inputs": [
              "values.scalar_context",
              "values.local_point_context",
              "values.pair_value_context"
            ],
            "outputs": [
              "values.ipa_delta"
            ],
            "codeBindings": [
              {
                "lexeme": "ipa_delta",
                "access": "write",
                "localRef": "values.ipa_delta",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.ipa_delta",
                "instanceFactRef": "block_instances.structure_ipa.values.ipa_delta",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "scalar_context",
                "access": "read",
                "localRef": "values.scalar_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_context",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_context",
                "occurrences": [
                  {
                    "start": 37,
                    "end": 51
                  }
                ]
              },
              {
                "lexeme": "local_point_context",
                "access": "read",
                "localRef": "values.local_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.local_point_context",
                "occurrences": [
                  {
                    "start": 53,
                    "end": 72
                  }
                ]
              },
              {
                "lexeme": "pair_value_context",
                "access": "read",
                "localRef": "values.pair_value_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_value_context",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_value_context",
                "occurrences": [
                  {
                    "start": 74,
                    "end": 92
                  }
                ]
              }
            ]
          },
          {
            "id": "residual_norm",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instanceFactRef": "block_instances.structure_ipa.steps.residual_norm",
            "label": "Residual, dropout, and norm",
            "operation": "residual_normalization",
            "code": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))",
            "inputs": [
              "ports.single_state",
              "values.ipa_delta"
            ],
            "outputs": [
              "ports.updated_single_state"
            ],
            "codeBindings": [
              {
                "lexeme": "updated_single_state",
                "access": "write",
                "localRef": "ports.updated_single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.updated_single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.updated_single_state",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 34,
                    "end": 46
                  }
                ]
              },
              {
                "lexeme": "ipa_delta",
                "access": "read",
                "localRef": "values.ipa_delta",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.ipa_delta",
                "instanceFactRef": "block_instances.structure_ipa.values.ipa_delta",
                "occurrences": [
                  {
                    "start": 57,
                    "end": 66
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "representations": [
      {
        "id": "generation_request",
        "scale": "sample",
        "semantic_role": "requested backbone length or motif-scaffolding specification",
        "shape": "B x request fields",
        "carries": [
          "target residue count",
          "optional motif PDB segments and scaffold placement ranges"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.setup and ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle",
        "scale": "mixed",
        "semantic_role": "residue layout, masks, and optional motif sequence and structure constraints",
        "shape": "B x N fields + B x N x N masks",
        "carries": [
          "residue and chain indices",
          "residue mask",
          "motif amino-acid identities and fixed-sequence mask",
          "motif C-alpha coordinates and fixed-structure mask"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward features argument"
            }
          ]
        }
      },
      {
        "id": "ca_coordinates",
        "scale": "residue",
        "semantic_role": "C-alpha coordinate trace used as the forward and reverse diffusion state",
        "shape": "B x N x 3",
        "carries": [
          "one C-alpha translation per residue"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_training_code",
              "role": "implementation_evidence",
              "locator": "Genie.training_step"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "glyph": "coordinates"
      },
      {
        "id": "residue_frames",
        "scale": "residue",
        "semantic_role": "derived per-residue rigid frames whose translations are C-alpha coordinates and whose rotations are reconstructed from the trace",
        "shape": "B x N x (3 x 3 + 3)",
        "carries": [
          "frame rotations",
          "C-alpha translations"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "glyph": "frames"
      },
      {
        "id": "timestep",
        "scale": "sample",
        "semantic_role": "current diffusion step",
        "shape": "B",
        "carries": [
          "noise level from 1 through 1000"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "coordinate_noise",
        "scale": "residue",
        "semantic_role": "sampled or predicted C-alpha translation noise",
        "shape": "B x N x 3",
        "carries": [
          "one three-vector per residue"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_training_code",
              "role": "implementation_evidence",
              "locator": "Genie.training_step"
            }
          ]
        }
      },
      {
        "id": "single_features",
        "scale": "residue",
        "semantic_role": "SE(3)-invariant per-residue latent state",
        "shape": "B x N x 384",
        "carries": [
          "residue and chain position",
          "diffusion timestep",
          "masked motif sequence identity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_features",
        "scale": "pair",
        "semantic_role": "SE(3)-invariant residue-pair latent state",
        "shape": "B x N x N x 128",
        "carries": [
          "single-feature outer sum",
          "relative sequence position and chain identity",
          "noisy-frame distances and orientations",
          "masked motif distances"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "backbone_pdb",
        "scale": "output",
        "semantic_role": "serialized generated backbone structure",
        "shape": "N x C-alpha records",
        "carries": [
          "generated coordinates with alanine placeholder residue types outside fixed motifs"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "generation_request",
        "representation_ref": "representations.generation_request",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle",
        "representation_ref": "representations.feature_bundle",
        "scope_ref": "architecture",
        "role": "prepared_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "initial_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "initial_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_frames",
        "representation_ref": "representations.residue_frames",
        "scope_ref": "modules.denoiser",
        "role": "derived_model_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep",
        "representation_ref": "representations.timestep",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "loop_control",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "fresh_step_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "stochastic_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "predicted_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "model_prediction",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "next_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "single_features",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "encoder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "pair_state_before_refinement",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_outgoing",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.pair_transform_stack",
        "role": "pair_state_after_outgoing_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_incoming",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.pair_transform_stack",
        "role": "pair_state_after_incoming_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "encoder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_ipa",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.equivariant_structure_decoder",
        "role": "attention_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_transition",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.equivariant_structure_decoder",
        "role": "transition_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames",
        "representation_ref": "representations.residue_frames",
        "scope_ref": "modules.denoiser",
        "role": "denoised_frame_estimate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "final_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "architecture",
        "role": "sampler_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "generated_backbone_pdb",
        "representation_ref": "representations.backbone_pdb",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "generation_request": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.generation_request_enters_feature_builder"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.feature_builder"
        ]
      },
      "feature_bundle": {
        "incomingRelationRefs": [
          "relations.feature_builder_produces_feature_bundle"
        ],
        "outgoingRelationRefs": [
          "relations.feature_bundle_sets_initial_coordinate_shape",
          "relations.feature_bundle_conditions_frenet_frame_builder",
          "relations.feature_bundle_conditions_single_feature_net",
          "relations.feature_bundle_conditions_pair_feature_net",
          "relations.feature_bundle_masks_ipa"
        ],
        "producerRefs": [
          "modules.feature_builder"
        ],
        "consumerRefs": [
          "modules.coordinate_initializer",
          "modules.frenet_frame_builder",
          "modules.single_feature_net",
          "modules.pair_feature_net",
          "modules.invariant_point_attention"
        ]
      },
      "initial_coordinates": {
        "incomingRelationRefs": [
          "relations.coordinate_initializer_produces_initial_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.initial_coordinates_begin_sampling_state"
        ],
        "producerRefs": [
          "modules.coordinate_initializer"
        ],
        "consumerRefs": [
          "value_sites.current_coordinates"
        ]
      },
      "current_coordinates": {
        "incomingRelationRefs": [
          "relations.initial_coordinates_begin_sampling_state",
          "relations.next_coordinates_reenter_sampling_state"
        ],
        "outgoingRelationRefs": [
          "relations.current_coordinates_enter_frenet_frame_builder",
          "relations.current_coordinates_enter_reverse_update"
        ],
        "producerRefs": [
          "value_sites.initial_coordinates",
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "modules.frenet_frame_builder",
          "modules.reverse_diffusion_update"
        ]
      },
      "current_frames": {
        "incomingRelationRefs": [
          "relations.frenet_frame_builder_produces_current_frames"
        ],
        "outgoingRelationRefs": [
          "relations.current_frames_enter_pair_feature_net",
          "relations.current_frames_condition_ipa",
          "relations.current_frames_enter_backbone_update",
          "relations.current_frames_enter_noise_readout"
        ],
        "producerRefs": [
          "modules.frenet_frame_builder"
        ],
        "consumerRefs": [
          "modules.pair_feature_net",
          "modules.invariant_point_attention",
          "modules.backbone_update",
          "modules.noise_readout"
        ]
      },
      "timestep": {
        "incomingRelationRefs": [
          "relations.timestep_controller_produces_timestep"
        ],
        "outgoingRelationRefs": [
          "relations.timestep_conditions_single_feature_net",
          "relations.timestep_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.timestep_controller"
        ],
        "consumerRefs": [
          "modules.single_feature_net",
          "modules.reverse_diffusion_update"
        ]
      },
      "fresh_step_noise": {
        "incomingRelationRefs": [
          "relations.step_noise_sampler_produces_fresh_noise"
        ],
        "outgoingRelationRefs": [
          "relations.fresh_noise_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.step_noise_sampler"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_update"
        ]
      },
      "predicted_noise": {
        "incomingRelationRefs": [
          "relations.noise_readout_produces_predicted_noise"
        ],
        "outgoingRelationRefs": [
          "relations.predicted_noise_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.noise_readout"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_update"
        ]
      },
      "next_coordinates": {
        "incomingRelationRefs": [
          "relations.reverse_update_produces_next_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.next_coordinates_reenter_sampling_state",
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "producerRefs": [
          "modules.reverse_diffusion_update"
        ],
        "consumerRefs": [
          "value_sites.current_coordinates",
          "value_sites.final_coordinates"
        ]
      },
      "single_features": {
        "incomingRelationRefs": [
          "relations.single_feature_net_produces_single_features"
        ],
        "outgoingRelationRefs": [
          "relations.single_features_feed_pair_feature_net",
          "relations.single_features_enter_ipa"
        ],
        "producerRefs": [
          "modules.single_feature_net"
        ],
        "consumerRefs": [
          "modules.pair_feature_net",
          "modules.invariant_point_attention"
        ]
      },
      "initial_pair_features": {
        "incomingRelationRefs": [
          "relations.pair_feature_net_produces_initial_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.initial_pair_features_enter_outgoing_update"
        ],
        "producerRefs": [
          "modules.pair_feature_net"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing"
        ]
      },
      "pair_after_outgoing": {
        "incomingRelationRefs": [
          "relations.outgoing_update_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_state_enters_incoming_update"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_outgoing"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_incoming"
        ]
      },
      "pair_after_incoming": {
        "incomingRelationRefs": [
          "relations.incoming_update_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_state_enters_pair_transition"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_incoming"
        ],
        "consumerRefs": [
          "modules.pair_transition"
        ]
      },
      "refined_pair_features": {
        "incomingRelationRefs": [
          "relations.pair_transition_produces_refined_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.refined_pair_features_bias_ipa"
        ],
        "producerRefs": [
          "modules.pair_transition"
        ],
        "consumerRefs": [
          "modules.invariant_point_attention"
        ]
      },
      "single_after_ipa": {
        "incomingRelationRefs": [
          "relations.ipa_produces_updated_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.ipa_state_enters_structure_transition"
        ],
        "producerRefs": [
          "modules.invariant_point_attention"
        ],
        "consumerRefs": [
          "modules.structure_transition"
        ]
      },
      "single_after_transition": {
        "incomingRelationRefs": [
          "relations.structure_transition_produces_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.single_state_enters_backbone_update"
        ],
        "producerRefs": [
          "modules.structure_transition"
        ],
        "consumerRefs": [
          "modules.backbone_update"
        ]
      },
      "updated_frames": {
        "incomingRelationRefs": [
          "relations.backbone_update_produces_updated_frames"
        ],
        "outgoingRelationRefs": [
          "relations.updated_frames_enter_noise_readout"
        ],
        "producerRefs": [
          "modules.backbone_update"
        ],
        "consumerRefs": [
          "modules.noise_readout"
        ]
      },
      "final_coordinates": {
        "incomingRelationRefs": [
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.final_coordinates_enter_pdb_exporter"
        ],
        "producerRefs": [
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "modules.pdb_exporter"
        ]
      },
      "generated_backbone_pdb": {
        "incomingRelationRefs": [
          "relations.pdb_exporter_writes_backbone_pdb"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.pdb_exporter"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "reverse_diffusion_loop",
          "repeats": 1000,
          "reruns": [
            "modules.timestep_controller",
            "modules.frenet_frame_builder",
            "modules.denoiser",
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ],
          "cached": [
            "value_sites.feature_bundle"
          ],
          "notes": [
            "The same residue layout and optional motif constraints are reused for every reverse step.",
            "Each step rebuilds Frenet frames from the current C-alpha translations before the next denoiser call.",
            "Fresh Gaussian step noise is added for steps 1000 through 2; step 1 uses the posterior mean directly."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_sampler_code",
                "role": "implementation_evidence",
                "locator": "BaseSampler._sample",
                "note": "The sampler iterates over reversed timesteps, calls the denoiser, applies the posterior formula, and reconstructs Frenet frames."
              }
            ]
          }
        },
        {
          "id": "pair_refinement_stack",
          "repeats": 5,
          "reruns": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_transition"
          ],
          "cached": [

          ],
          "notes": [
            "The released base configuration enables both triangular multiplicative updates and disables triangular attention."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_pair_transform_code",
                "role": "implementation_evidence",
                "locator": "PairTransformNet and PairTransformLayer"
              },
              {
                "source_ref": "genie2_config_code",
                "role": "configuration_evidence",
                "locator": "Config._create_config"
              }
            ]
          }
        },
        {
          "id": "structure_refinement_stack",
          "repeats": 8,
          "reruns": [
            "modules.invariant_point_attention",
            "modules.structure_transition",
            "modules.backbone_update"
          ],
          "cached": [
            "value_sites.refined_pair_features"
          ],
          "notes": [
            "Each structure layer updates the single state and composes a learned rigid-frame increment into the current frames."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_structure_code",
                "role": "implementation_evidence",
                "locator": "StructureLayer.forward and StructureNet.forward"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "diffusion_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      "denoiser_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      "pair_state": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      "conditioning_features": {
        "representation_ref": "representations.feature_bundle",
        "value_site_refs": [
          "value_sites.feature_bundle"
        ],
        "lifecycle": "read_only_across_sampling",
        "notes": [
          "The bundle carries residue layout plus optional motif sequence and intra-motif geometry constraints."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "initial_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "next_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "updated_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "initial_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_outgoing": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_incoming": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "refined_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "feature_bundle": {
        "representation_ref": "representations.feature_bundle",
        "value_site_refs": [
          "value_sites.feature_bundle"
        ],
        "lifecycle": "read_only_across_sampling",
        "notes": [
          "The bundle carries residue layout plus optional motif sequence and intra-motif geometry constraints."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        },
        "groupId": "conditioning_features"
      }
    },
    "conditioning": [
      {
        "id": "motif_sequence_conditioning",
        "relation_ref": "relations.feature_bundle_conditions_single_feature_net",
        "mode": "masked_motif_sequence",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward",
              "note": "Motif amino-acid one-hot features are multiplied by fixed_sequence_mask before concatenation."
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.single_feature_net"
      },
      {
        "id": "motif_geometry_conditioning",
        "relation_ref": "relations.feature_bundle_conditions_pair_feature_net",
        "mode": "masked_intra_motif_distances",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward",
              "note": "Motif C-alpha distance bins are gated by fixed_structure_mask before projection into pair features."
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.pair_feature_net"
      },
      {
        "id": "pair_conditioned_structure_attention",
        "relation_ref": "relations.refined_pair_features_bias_ipa",
        "mode": "pair_bias",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward",
              "note": "IPA consumes the pair representation alongside single features and current frames."
            }
          ]
        },
        "source": "value_sites.refined_pair_features",
        "target": "modules.invariant_point_attention"
      },
      {
        "id": "frame_conditioned_structure_attention",
        "relation_ref": "relations.current_frames_condition_ipa",
        "mode": "invariant_point_geometry",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        },
        "source": "value_sites.current_frames",
        "target": "modules.invariant_point_attention"
      }
    ],
    "scaleTransitions": [
      {
        "id": "single_to_pair_expansion",
        "relation_path": [
          "relations.single_features_feed_pair_feature_net",
          "relations.pair_feature_net_produces_initial_pair_features"
        ],
        "aggregation": "outer_sum_and_pair_geometry",
        "copy_vs_pool": "expand",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward",
              "note": "Projected residue i and j features are outer-summed into an N by N pair state, then geometric and relative-position terms are added."
            }
          ]
        },
        "source": "value_sites.single_features",
        "target": "value_sites.initial_pair_features",
        "from_scale": "residue",
        "to_scale": "pair",
        "projection_refs": [
          "modules.pair_feature_net"
        ]
      },
      {
        "id": "coordinates_to_pdb_records",
        "relation_path": [
          "relations.final_coordinates_enter_pdb_exporter",
          "relations.pdb_exporter_writes_backbone_pdb"
        ],
        "aggregation": "serialize_ca_records",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        },
        "source": "value_sites.final_coordinates",
        "target": "value_sites.generated_backbone_pdb",
        "from_scale": "residue",
        "to_scale": "output",
        "projection_refs": [
          "modules.pdb_exporter"
        ]
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "coordinate_noise_prediction",
        "notes": [
          "Training minimizes motif-weighted per-residue mean squared error between predicted and sampled C-alpha translation noise.",
          "The released base configuration uses a motif probability of 1.0, while the model still supports unconditional inference through empty conditioning masks."
        ]
      },
      "schedule": {
        "kind": "cosine_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddpm",
        "steps": 1000,
        "configurable": false,
        "base_schedule_steps": 1000,
        "timestep_selection": "full_reverse_chain",
        "initial_state": "standard_normal_ca_coordinates",
        "guidance": "none",
        "update": "fixed_variance_posterior",
        "clip_denoised": false
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "Genie 2 is sequence-agnostic at generation time; non-motif output residues are written with alanine placeholders.",
        "The sampler's scale parameter multiplies the Gaussian term in each nonfinal reverse step; the README recommends different values for unconditional generation and motif scaffolding.",
        "The base architecture uses triangular multiplicative updates but not triangular attention."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_training_code",
            "role": "implementation_evidence",
            "locator": "Genie.training_step"
          },
          {
            "source_ref": "genie2_sampler_code",
            "role": "implementation_evidence",
            "locator": "BaseSampler._sample"
          },
          {
            "source_ref": "genie2_config_code",
            "role": "configuration_evidence",
            "locator": "Config._create_config"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "generation_request_enters_feature_builder",
        "from": "value_sites.generation_request",
        "to": "modules.feature_builder",
        "kind": "data_flow",
        "carries": [
          "representations.generation_request"
        ],
        "operation": "parse_generation_request",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_builder_produces_feature_bundle",
        "from": "modules.feature_builder",
        "to": "value_sites.feature_bundle",
        "kind": "data_flow",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "build_sampling_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_sets_initial_coordinate_shape",
        "from": "value_sites.feature_bundle",
        "to": "modules.coordinate_initializer",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "size_random_coordinate_tensor",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "coordinate_initializer_produces_initial_coordinates",
        "from": "modules.coordinate_initializer",
        "to": "value_sites.initial_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "sample_gaussian_ca_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "initial_coordinates_begin_sampling_state",
        "from": "value_sites.initial_coordinates",
        "to": "value_sites.current_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "initialize_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_coordinates_enter_frenet_frame_builder",
        "from": "value_sites.current_coordinates",
        "to": "modules.frenet_frame_builder",
        "kind": "data_flow",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "provide_current_ca_trace",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_frenet_frame_builder",
        "from": "value_sites.feature_bundle",
        "to": "modules.frenet_frame_builder",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_chain_indices_and_residue_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "frenet_frame_builder_produces_current_frames",
        "from": "modules.frenet_frame_builder",
        "to": "value_sites.current_frames",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "derive_frenet_rotations_and_package_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_controller_produces_timestep",
        "from": "modules.timestep_controller",
        "to": "value_sites.timestep",
        "kind": "control",
        "carries": [
          "representations.timestep"
        ],
        "operation": "enumerate_reverse_timestep",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_single_feature_net",
        "from": "value_sites.feature_bundle",
        "to": "modules.single_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_layout_and_masked_sequence",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "timestep_conditions_single_feature_net",
        "from": "value_sites.timestep",
        "to": "modules.single_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.timestep"
        ],
        "operation": "sinusoidal_timestep_encoding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_feature_net_produces_single_features",
        "from": "modules.single_feature_net",
        "to": "value_sites.single_features",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "concatenate_and_project",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_features_feed_pair_feature_net",
        "from": "value_sites.single_features",
        "to": "modules.pair_feature_net",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "project_outer_sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_pair_feature_net",
        "from": "value_sites.current_frames",
        "to": "modules.pair_feature_net",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "encode_noisy_frame_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_pair_feature_net",
        "from": "value_sites.feature_bundle",
        "to": "modules.pair_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_relative_positions_and_masked_motif_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_feature_net_produces_initial_pair_features",
        "from": "modules.pair_feature_net",
        "to": "value_sites.initial_pair_features",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "sum_projected_pair_terms",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features_enter_outgoing_update",
        "from": "value_sites.initial_pair_features",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "triangular_multiplication_outgoing",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "outgoing_update_produces_pair_state",
        "from": "modules.triangle_multiplication_outgoing",
        "to": "value_sites.pair_after_outgoing",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_state_enters_incoming_update",
        "from": "value_sites.pair_after_outgoing",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "triangular_multiplication_incoming",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "incoming_update_produces_pair_state",
        "from": "modules.triangle_multiplication_incoming",
        "to": "value_sites.pair_after_incoming",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_state_enters_pair_transition",
        "from": "value_sites.pair_after_incoming",
        "to": "modules.pair_transition",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "pair_transition_mlp",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition_produces_refined_pair_features",
        "from": "modules.pair_transition",
        "to": "value_sites.refined_pair_features",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_transition",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_features_enter_ipa",
        "from": "value_sites.single_features",
        "to": "modules.invariant_point_attention",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "attend_from_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_pair_features_bias_ipa",
        "from": "value_sites.refined_pair_features",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "pair_conditioned_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_condition_ipa",
        "from": "value_sites.current_frames",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "express_attention_points_in_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_masks_ipa",
        "from": "value_sites.feature_bundle",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "mask_padded_residues",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "ipa_produces_updated_single_state",
        "from": "modules.invariant_point_attention",
        "to": "value_sites.single_after_ipa",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "residual_attention_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "ipa_state_enters_structure_transition",
        "from": "value_sites.single_after_ipa",
        "to": "modules.structure_transition",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "transition_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "structure_transition_produces_single_state",
        "from": "modules.structure_transition",
        "to": "value_sites.single_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "feed_forward_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_state_enters_backbone_update",
        "from": "value_sites.single_after_transition",
        "to": "modules.backbone_update",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "regress_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_backbone_update",
        "from": "value_sites.current_frames",
        "to": "modules.backbone_update",
        "kind": "state_update",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "compose_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "backbone_update_produces_updated_frames",
        "from": "modules.backbone_update",
        "to": "value_sites.updated_frames",
        "kind": "state_update",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "compose_updated_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_noise_readout",
        "from": "value_sites.current_frames",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "retain_noisy_translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames_enter_noise_readout",
        "from": "value_sites.updated_frames",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "read_updated_translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "noise_readout_produces_predicted_noise",
        "from": "modules.noise_readout",
        "to": "value_sites.predicted_noise",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "subtract_updated_from_noisy_translation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "current_coordinates_enter_reverse_update",
        "from": "value_sites.current_coordinates",
        "to": "modules.reverse_diffusion_update",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "provide_current_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "predicted_noise_enters_reverse_update",
        "from": "value_sites.predicted_noise",
        "to": "modules.reverse_diffusion_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "parameterize_posterior_mean",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_enters_reverse_update",
        "from": "value_sites.timestep",
        "to": "modules.reverse_diffusion_update",
        "kind": "control",
        "carries": [
          "representations.timestep"
        ],
        "operation": "select_schedule_coefficients",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "step_noise_sampler_produces_fresh_noise",
        "from": "modules.step_noise_sampler",
        "to": "value_sites.fresh_step_noise",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "sample_gaussian_noise",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "fresh_noise_enters_reverse_update",
        "from": "value_sites.fresh_step_noise",
        "to": "modules.reverse_diffusion_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "add_scaled_step_noise",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "reverse_update_produces_next_coordinates",
        "from": "modules.reverse_diffusion_update",
        "to": "value_sites.next_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "sample_next_ca_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "next_coordinates_reenter_sampling_state",
        "from": "value_sites.next_coordinates",
        "to": "value_sites.current_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "continue_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "terminal_coordinates_become_final_coordinates",
        "from": "value_sites.next_coordinates",
        "to": "value_sites.final_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "select_step_one_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "final_coordinates_enter_pdb_exporter",
        "from": "value_sites.final_coordinates",
        "to": "modules.pdb_exporter",
        "kind": "data_flow",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "prepare_ca_records",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      },
      {
        "id": "pdb_exporter_writes_backbone_pdb",
        "from": "modules.pdb_exporter",
        "to": "value_sites.generated_backbone_pdb",
        "kind": "data_flow",
        "carries": [
          "representations.backbone_pdb"
        ],
        "operation": "serialize_pdb",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "motif_geometry_is_intra_group",
        "statement": "For multi-motif inputs, fixed_structure_mask exposes distances within each motif group while leaving relative positions and orientations between groups unspecified.",
        "scope": {
          "module_ref": "modules.pair_feature_net"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "genie2_2024",
              "role": "supporting_evidence",
              "locator": "Sec. 2.2 and Fig. 1"
            }
          ]
        }
      },
      {
        "id": "model_is_sequence_agnostic",
        "statement": "Genie 2 generates C-alpha backbone geometry rather than a complete amino-acid sequence; motif identities may condition the model, while generated scaffold residues use alanine placeholders in exported PDB files.",
        "scope": {
          "module_ref": "modules.pdb_exporter"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler.on_sample_end documentation"
            }
          ]
        }
      },
      {
        "id": "base_model_omits_triangle_attention",
        "statement": "The implementation supports triangular attention, but the released base configuration disables it; the active pair-transform board therefore shows triangular multiplication and pair transition only.",
        "scope": {
          "module_ref": "modules.pair_transform_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_config_code",
              "role": "configuration_evidence",
              "locator": "Config._create_config"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "duplicated_fixed_sequence_mask_channel",
        "question": "Is concatenating fixed_sequence_mask twice in SingleFeatureNet.forward intentional, or is one channel a legacy placeholder for a removed feature?",
        "status": "unresolved",
        "affected_refs": [
          "modules.single_feature_net"
        ],
        "blocking": false,
        "resolution_criteria": "Confirm the intended 20 + 3 auxiliary-channel design with the authors or a later revision of the implementation.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "question_source",
              "locator": "SingleFeatureNet.forward torch.cat",
              "note": "The concatenation includes fixed_sequence_mask twice followed by interface_mask."
            }
          ]
        }
      }
    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_feature_schema_code",
        "kind": "code",
        "title": "Genie 3 feature dictionary registry",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/np/features.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
    "invariant_point_attention": {
      "id": "invariant_point_attention",
      "schemaVersion": "standard-block-v0.2",
      "name": "Invariant Point Attention",
      "sourceYaml": "../../standard_blocks/invariant-point-attention.yaml",
      "description": "Combine scalar attention, pair bias, and frame-aware point-distance logits, then aggregate scalar, point, and pair values into a residual-normalized single-state update.",
      "math": [
        {
          "id": "project_scalar_terms",
          "text": "q_s, k_s, v_s = project_scalar_qkv(single_state)",
          "operation": "scalar_qkv_projection"
        },
        {
          "id": "project_local_points",
          "text": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)",
          "operation": "point_qkv_projection"
        },
        {
          "id": "transform_points_to_global",
          "text": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)",
          "operation": "rigid_apply"
        },
        {
          "id": "scalar_attention_logits",
          "text": "scalar_logits = dot(q_s, k_s) * scalar_scale",
          "operation": "attention_logits"
        },
        {
          "id": "point_distance_logits",
          "text": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)",
          "operation": "invariant_point_distance"
        },
        {
          "id": "project_pair_bias",
          "text": "pair_bias = linear_b(pair_context)",
          "operation": "pair_bias_projection"
        },
        {
          "id": "combine_and_mask_logits",
          "text": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)",
          "operation": "ipa_logit_composition"
        },
        {
          "id": "softmax_attention",
          "text": "attention = softmax(combined_logits, dim=keys)",
          "operation": "softmax"
        },
        {
          "id": "aggregate_scalar_values",
          "text": "scalar_context = weighted_sum(attention, v_s)",
          "operation": "weighted_sum"
        },
        {
          "id": "aggregate_global_points",
          "text": "global_point_context = weighted_sum(attention, v_p_global)",
          "operation": "weighted_point_sum"
        },
        {
          "id": "return_points_to_local_frame",
          "text": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))",
          "operation": "rigid_inverse_apply"
        },
        {
          "id": "aggregate_pair_values",
          "text": "pair_value_context = weighted_sum(attention, pair_context)",
          "operation": "pair_value_aggregation"
        },
        {
          "id": "project_ipa_delta",
          "text": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))",
          "operation": "output_projection"
        },
        {
          "id": "residual_norm",
          "text": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))",
          "operation": "residual_normalization"
        }
      ],
      "kind": "attention",
      "status": "review",
      "ports": [
        {
          "id": "single_state",
          "label": "single state",
          "direction": "input",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "data_flow",
            "state_update"
          ],
          "glyph": "single",
          "notation": "s"
        },
        {
          "id": "pair_context",
          "label": "pair context",
          "direction": "conditioning",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "data_flow"
          ],
          "glyph": "pair",
          "notation": "z"
        },
        {
          "id": "frames",
          "label": "current frames",
          "direction": "conditioning",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "data_flow"
          ],
          "glyph": "frames",
          "notation": "T"
        },
        {
          "id": "mask",
          "label": "valid-item mask",
          "direction": "conditioning",
          "kind": "mask",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "control"
          ],
          "glyph": "vector",
          "notation": "m"
        },
        {
          "id": "updated_single_state",
          "label": "IPA-updated single state",
          "direction": "output",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "data_flow",
            "state_update"
          ],
          "glyph": "single",
          "notation": "s_ipa"
        }
      ],
      "variants": [
        {
          "id": "full_ipa_residual_norm",
          "label": "Full IPA + residual normalization",
          "description": "Full scalar, point, and pair aggregation followed by the StructureLayer residual, dropout, and LayerNorm wrapper.",
          "step_refs": [
            "steps.project_scalar_terms",
            "steps.project_local_points",
            "steps.transform_points_to_global",
            "steps.scalar_attention_logits",
            "steps.point_distance_logits",
            "steps.project_pair_bias",
            "steps.combine_and_mask_logits",
            "steps.softmax_attention",
            "steps.aggregate_scalar_values",
            "steps.aggregate_global_points",
            "steps.return_points_to_local_frame",
            "steps.aggregate_pair_values",
            "steps.project_ipa_delta",
            "steps.residual_norm"
          ]
        }
      ],
      "defaultVariant": "full_ipa_residual_norm",
      "values": [
        {
          "id": "scalar_terms",
          "label": "scalar Q/K/V",
          "kind": "representation",
          "glyph": "single",
          "notation": "qkv_s"
        },
        {
          "id": "local_points",
          "label": "local Q/K/V points",
          "kind": "geometry",
          "glyph": "coordinates",
          "notation": "qkv_p"
        },
        {
          "id": "global_points",
          "label": "global Q/K/V points",
          "kind": "geometry",
          "glyph": "coordinates",
          "notation": "T_qkv_p"
        },
        {
          "id": "scalar_logits",
          "label": "scalar logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_s"
        },
        {
          "id": "point_logits",
          "label": "point-distance logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_p"
        },
        {
          "id": "pair_bias",
          "label": "pair bias",
          "kind": "logit",
          "glyph": "pair",
          "notation": "b_z"
        },
        {
          "id": "combined_logits",
          "label": "combined masked logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l"
        },
        {
          "id": "attention_weights",
          "label": "attention weights",
          "kind": "weight",
          "glyph": "pair",
          "notation": "a"
        },
        {
          "id": "scalar_context",
          "label": "scalar context",
          "kind": "representation",
          "glyph": "single",
          "notation": "o_s"
        },
        {
          "id": "global_point_context",
          "label": "global point context",
          "kind": "geometry",
          "glyph": "coordinates",
          "notation": "o_p_global"
        },
        {
          "id": "local_point_context",
          "label": "local points + norms",
          "kind": "geometry",
          "glyph": "coordinates",
          "notation": "o_p_local"
        },
        {
          "id": "pair_value_context",
          "label": "pair-value context",
          "kind": "representation",
          "glyph": "single",
          "notation": "o_z"
        },
        {
          "id": "ipa_delta",
          "label": "IPA delta",
          "kind": "representation",
          "glyph": "single",
          "notation": "delta_s"
        }
      ],
      "steps": [
        {
          "id": "project_scalar_terms",
          "label": "Project scalar Q/K/V",
          "operation": "scalar_qkv_projection",
          "inputs": [
            "ports.single_state"
          ],
          "outputs": [
            "values.scalar_terms"
          ],
          "code": "q_s, k_s, v_s = project_scalar_qkv(single_state)",
          "code_bindings": [
            {
              "lexeme": "q_s",
              "ref": "values.scalar_terms",
              "access": "write"
            },
            {
              "lexeme": "k_s",
              "ref": "values.scalar_terms",
              "access": "write"
            },
            {
              "lexeme": "v_s",
              "ref": "values.scalar_terms",
              "access": "write"
            },
            {
              "lexeme": "single_state",
              "ref": "ports.single_state",
              "access": "read"
            }
          ]
        },
        {
          "id": "project_local_points",
          "label": "Project local Q/K/V points",
          "operation": "point_qkv_projection",
          "inputs": [
            "ports.single_state"
          ],
          "outputs": [
            "values.local_points"
          ],
          "code": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)",
          "code_bindings": [
            {
              "lexeme": "q_p_local",
              "ref": "values.local_points",
              "access": "write"
            },
            {
              "lexeme": "k_p_local",
              "ref": "values.local_points",
              "access": "write"
            },
            {
              "lexeme": "v_p_local",
              "ref": "values.local_points",
              "access": "write"
            },
            {
              "lexeme": "single_state",
              "ref": "ports.single_state",
              "access": "read"
            }
          ]
        },
        {
          "id": "transform_points_to_global",
          "label": "Express points in global frame",
          "operation": "rigid_apply",
          "inputs": [
            "values.local_points",
            "ports.frames"
          ],
          "outputs": [
            "values.global_points"
          ],
          "code": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)",
          "code_bindings": [
            {
              "lexeme": "q_p_global",
              "ref": "values.global_points",
              "access": "write"
            },
            {
              "lexeme": "k_p_global",
              "ref": "values.global_points",
              "access": "write"
            },
            {
              "lexeme": "v_p_global",
              "ref": "values.global_points",
              "access": "write"
            },
            {
              "lexeme": "frames",
              "ref": "ports.frames",
              "access": "read"
            },
            {
              "lexeme": "q_p_local",
              "ref": "values.local_points",
              "access": "read"
            },
            {
              "lexeme": "k_p_local",
              "ref": "values.local_points",
              "access": "read"
            },
            {
              "lexeme": "v_p_local",
              "ref": "values.local_points",
              "access": "read"
            }
          ]
        },
        {
          "id": "scalar_attention_logits",
          "label": "Form scalar logits",
          "operation": "attention_logits",
          "inputs": [
            "values.scalar_terms"
          ],
          "outputs": [
            "values.scalar_logits"
          ],
          "code": "scalar_logits = dot(q_s, k_s) * scalar_scale",
          "code_bindings": [
            {
              "lexeme": "scalar_logits",
              "ref": "values.scalar_logits",
              "access": "write"
            },
            {
              "lexeme": "q_s",
              "ref": "values.scalar_terms",
              "access": "read"
            },
            {
              "lexeme": "k_s",
              "ref": "values.scalar_terms",
              "access": "read"
            }
          ]
        },
        {
          "id": "point_distance_logits",
          "label": "Form point-distance logits",
          "operation": "invariant_point_distance",
          "inputs": [
            "values.global_points"
          ],
          "outputs": [
            "values.point_logits"
          ],
          "code": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)",
          "code_bindings": [
            {
              "lexeme": "point_logits",
              "ref": "values.point_logits",
              "access": "write"
            },
            {
              "lexeme": "q_p_global",
              "ref": "values.global_points",
              "access": "read"
            },
            {
              "lexeme": "k_p_global",
              "ref": "values.global_points",
              "access": "read"
            }
          ]
        },
        {
          "id": "project_pair_bias",
          "label": "Project pair bias",
          "operation": "pair_bias_projection",
          "inputs": [
            "ports.pair_context"
          ],
          "outputs": [
            "values.pair_bias"
          ],
          "code": "pair_bias = linear_b(pair_context)",
          "code_bindings": [
            {
              "lexeme": "pair_bias",
              "ref": "values.pair_bias",
              "access": "write"
            },
            {
              "lexeme": "pair_context",
              "ref": "ports.pair_context",
              "access": "read"
            }
          ]
        },
        {
          "id": "combine_and_mask_logits",
          "label": "Combine logits and apply mask",
          "operation": "ipa_logit_composition",
          "inputs": [
            "values.scalar_logits",
            "values.point_logits",
            "values.pair_bias",
            "ports.mask"
          ],
          "outputs": [
            "values.combined_logits"
          ],
          "code": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)",
          "code_bindings": [
            {
              "lexeme": "combined_logits",
              "ref": "values.combined_logits",
              "access": "write"
            },
            {
              "lexeme": "scalar_logits",
              "ref": "values.scalar_logits",
              "access": "read"
            },
            {
              "lexeme": "point_logits",
              "ref": "values.point_logits",
              "access": "read"
            },
            {
              "lexeme": "pair_bias",
              "ref": "values.pair_bias",
              "access": "read"
            },
            {
              "lexeme": "mask",
              "ref": "ports.mask",
              "access": "read"
            }
          ]
        },
        {
          "id": "softmax_attention",
          "label": "Normalize over keys",
          "operation": "softmax",
          "inputs": [
            "values.combined_logits"
          ],
          "outputs": [
            "values.attention_weights"
          ],
          "code": "attention = softmax(combined_logits, dim=keys)",
          "code_bindings": [
            {
              "lexeme": "attention",
              "ref": "values.attention_weights",
              "access": "write"
            },
            {
              "lexeme": "combined_logits",
              "ref": "values.combined_logits",
              "access": "read"
            }
          ]
        },
        {
          "id": "aggregate_scalar_values",
          "label": "Aggregate scalar values",
          "operation": "weighted_sum",
          "inputs": [
            "values.attention_weights",
            "values.scalar_terms"
          ],
          "outputs": [
            "values.scalar_context"
          ],
          "code": "scalar_context = weighted_sum(attention, v_s)",
          "code_bindings": [
            {
              "lexeme": "scalar_context",
              "ref": "values.scalar_context",
              "access": "write"
            },
            {
              "lexeme": "attention",
              "ref": "values.attention_weights",
              "access": "read"
            },
            {
              "lexeme": "v_s",
              "ref": "values.scalar_terms",
              "access": "read"
            }
          ]
        },
        {
          "id": "aggregate_global_points",
          "label": "Aggregate value points",
          "operation": "weighted_point_sum",
          "inputs": [
            "values.attention_weights",
            "values.global_points"
          ],
          "outputs": [
            "values.global_point_context"
          ],
          "code": "global_point_context = weighted_sum(attention, v_p_global)",
          "code_bindings": [
            {
              "lexeme": "global_point_context",
              "ref": "values.global_point_context",
              "access": "write"
            },
            {
              "lexeme": "attention",
              "ref": "values.attention_weights",
              "access": "read"
            },
            {
              "lexeme": "v_p_global",
              "ref": "values.global_points",
              "access": "read"
            }
          ]
        },
        {
          "id": "return_points_to_local_frame",
          "label": "Return points to query frame",
          "operation": "rigid_inverse_apply",
          "inputs": [
            "values.global_point_context",
            "ports.frames"
          ],
          "outputs": [
            "values.local_point_context"
          ],
          "code": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))",
          "code_bindings": [
            {
              "lexeme": "local_point_context",
              "ref": "values.local_point_context",
              "access": "write"
            },
            {
              "lexeme": "frames",
              "ref": "ports.frames",
              "access": "read"
            },
            {
              "lexeme": "global_point_context",
              "ref": "values.global_point_context",
              "access": "read"
            }
          ]
        },
        {
          "id": "aggregate_pair_values",
          "label": "Aggregate pair values",
          "operation": "pair_value_aggregation",
          "inputs": [
            "values.attention_weights",
            "ports.pair_context"
          ],
          "outputs": [
            "values.pair_value_context"
          ],
          "code": "pair_value_context = weighted_sum(attention, pair_context)",
          "code_bindings": [
            {
              "lexeme": "pair_value_context",
              "ref": "values.pair_value_context",
              "access": "write"
            },
            {
              "lexeme": "attention",
              "ref": "values.attention_weights",
              "access": "read"
            },
            {
              "lexeme": "pair_context",
              "ref": "ports.pair_context",
              "access": "read"
            }
          ]
        },
        {
          "id": "project_ipa_delta",
          "label": "Fuse IPA outputs",
          "operation": "output_projection",
          "inputs": [
            "values.scalar_context",
            "values.local_point_context",
            "values.pair_value_context"
          ],
          "outputs": [
            "values.ipa_delta"
          ],
          "code": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))",
          "code_bindings": [
            {
              "lexeme": "ipa_delta",
              "ref": "values.ipa_delta",
              "access": "write"
            },
            {
              "lexeme": "scalar_context",
              "ref": "values.scalar_context",
              "access": "read"
            },
            {
              "lexeme": "local_point_context",
              "ref": "values.local_point_context",
              "access": "read"
            },
            {
              "lexeme": "pair_value_context",
              "ref": "values.pair_value_context",
              "access": "read"
            }
          ]
        },
        {
          "id": "residual_norm",
          "label": "Residual, dropout, and norm",
          "operation": "residual_normalization",
          "inputs": [
            "ports.single_state",
            "values.ipa_delta"
          ],
          "outputs": [
            "ports.updated_single_state"
          ],
          "code": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))",
          "code_bindings": [
            {
              "lexeme": "updated_single_state",
              "ref": "ports.updated_single_state",
              "access": "write"
            },
            {
              "lexeme": "single_state",
              "ref": "ports.single_state",
              "access": "read"
            },
            {
              "lexeme": "ipa_delta",
              "ref": "values.ipa_delta",
              "access": "read"
            }
          ]
        }
      ],
      "visualTemplate": {
        "grid": {
          "columns": 12,
          "rows": 10,
          "column_sizing": "content",
          "col_gap": 20,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "single_state",
            "ref": "ports.single_state",
            "col": 1,
            "row": 1,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "pair_context",
            "ref": "ports.pair_context",
            "col": 1,
            "row": 3,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "frames",
            "ref": "ports.frames",
            "col": 1,
            "row": 4,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "mask",
            "ref": "ports.mask",
            "col": 4,
            "row": 4,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "updated_single_state",
            "ref": "ports.updated_single_state",
            "col": 12,
            "row": 10,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "project_scalar_terms",
            "ref": "steps.project_scalar_terms",
            "col": 2,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_terms",
            "ref": "values.scalar_terms",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "scalar_attention_logits",
            "ref": "steps.scalar_attention_logits",
            "col": 4,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_logits",
            "ref": "values.scalar_logits",
            "col": 5,
            "row": 1,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_local_points",
            "ref": "steps.project_local_points",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "local_points",
            "ref": "values.local_points",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "transform_points_to_global",
            "ref": "steps.transform_points_to_global",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "global_points",
            "ref": "values.global_points",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "point_distance_logits",
            "ref": "steps.point_distance_logits",
            "col": 6,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "point_logits",
            "ref": "values.point_logits",
            "col": 7,
            "row": 2,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_pair_bias",
            "ref": "steps.project_pair_bias",
            "col": 2,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_bias",
            "ref": "values.pair_bias",
            "col": 5,
            "row": 3,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "combine_and_mask_logits",
            "ref": "steps.combine_and_mask_logits",
            "col": 6,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "combined_logits",
            "ref": "values.combined_logits",
            "col": 7,
            "row": 4,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "softmax_attention",
            "ref": "steps.softmax_attention",
            "col": 6,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "attention_weights",
            "ref": "values.attention_weights",
            "col": 7,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_scalar_values",
            "ref": "steps.aggregate_scalar_values",
            "col": 7,
            "row": 7,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_context",
            "ref": "values.scalar_context",
            "col": 8,
            "row": 7,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_pair_values",
            "ref": "steps.aggregate_pair_values",
            "col": 7,
            "row": 8,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_value_context",
            "ref": "values.pair_value_context",
            "col": 8,
            "row": 8,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_global_points",
            "ref": "steps.aggregate_global_points",
            "col": 7,
            "row": 9,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "global_point_context",
            "ref": "values.global_point_context",
            "col": 8,
            "row": 9,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "return_points_to_local_frame",
            "ref": "steps.return_points_to_local_frame",
            "col": 9,
            "row": 9,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "local_point_context",
            "ref": "values.local_point_context",
            "col": 10,
            "row": 9,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_ipa_delta",
            "ref": "steps.project_ipa_delta",
            "col": 9,
            "row": 10,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "ipa_delta",
            "ref": "values.ipa_delta",
            "col": 10,
            "row": 10,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "residual_norm",
            "ref": "steps.residual_norm",
            "col": 11,
            "row": 10,
            "prominence": "primary",
            "treatment": "compact"
          }
        ],
        "segments": [
          {
            "id": "attention_weights",
            "label": "Compute attention weights",
            "description": "Form scalar and invariant point-distance logits, add pair bias, apply the validity mask, and normalize once over keys. Bundled Q/K/V projections also prepare the value terms consumed in Phase 2.",
            "node_refs": [
              "ports.single_state",
              "ports.pair_context",
              "ports.frames",
              "ports.mask",
              "steps.project_scalar_terms",
              "values.scalar_terms",
              "steps.scalar_attention_logits",
              "values.scalar_logits",
              "steps.project_local_points",
              "values.local_points",
              "steps.transform_points_to_global",
              "values.global_points",
              "steps.point_distance_logits",
              "values.point_logits",
              "steps.project_pair_bias",
              "values.pair_bias",
              "steps.combine_and_mask_logits",
              "values.combined_logits",
              "steps.softmax_attention",
              "values.attention_weights"
            ]
          },
          {
            "id": "value_extraction",
            "label": "Extract values and update state",
            "description": "Reuse the shared attention weights for scalar, point, and pair values, return points to the local frame, fuse the contexts, and apply the residual wrapper.",
            "node_refs": [
              "steps.aggregate_scalar_values",
              "values.scalar_context",
              "steps.aggregate_global_points",
              "values.global_point_context",
              "steps.return_points_to_local_frame",
              "values.local_point_context",
              "steps.aggregate_pair_values",
              "values.pair_value_context",
              "steps.project_ipa_delta",
              "values.ipa_delta",
              "steps.residual_norm",
              "ports.updated_single_state"
            ]
          }
        ]
      },
      "evidencePolicy": {
        "generic_definition": "Full IPA anatomy is reusable vocabulary; each architecture instance must separately prove its core and wrapper variant.",
        "usage_requires": [
          "Evidence for scalar, point-distance, and pair logit terms.",
          "Evidence for scalar, point, and pair-value aggregation.",
          "Evidence for the residual/dropout/normalization wrapper when full_ipa_residual_norm is selected."
        ]
      }
    }
  },
  "pseudocode": {
    "genie2": {
      "schemaVersion": "pseudocode-v0.1",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "genie2",
      "title": "Genie 2 Sampling and Denoiser Trace",
      "sources": [
        {
          "id": "sampler_code",
          "source_ref": "genie2_sampler_code"
        },
        {
          "id": "model_code",
          "source_ref": "genie2_model_code"
        },
        {
          "id": "single_code",
          "source_ref": "genie2_single_feature_code"
        },
        {
          "id": "pair_code",
          "source_ref": "genie2_pair_feature_code"
        },
        {
          "id": "pair_transform_code",
          "source_ref": "genie2_pair_transform_code"
        },
        {
          "id": "structure_code",
          "source_ref": "genie2_structure_code"
        }
      ],
      "scopes": [

      ],
      "symbols": [
        {
          "id": "feature_bundle",
          "name": "features",
          "type": "input",
          "shape": "B x N fields + B x N x N masks",
          "representationRef": "representations.feature_bundle",
          "scale": "mixed",
          "architectureRef": "representations.feature_bundle"
        },
        {
          "id": "current_coordinates",
          "name": "x_t",
          "tex": "x_t",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.ca_coordinates",
          "scale": "residue",
          "glyph": "coordinates",
          "architectureRef": "representations.ca_coordinates"
        },
        {
          "id": "current_frames",
          "name": "T_t",
          "tex": "T_t",
          "type": "representation",
          "shape": "B x N x (3 x 3 + 3)",
          "representationRef": "representations.residue_frames",
          "scale": "residue",
          "glyph": "frames",
          "architectureRef": "representations.residue_frames"
        },
        {
          "id": "timestep",
          "name": "t",
          "type": "input",
          "shape": "B",
          "representationRef": "representations.timestep",
          "scale": "sample",
          "architectureRef": "representations.timestep"
        },
        {
          "id": "single_features",
          "name": "s",
          "type": "representation",
          "shape": "B x N x 384",
          "representationRef": "representations.single_features",
          "scale": "residue",
          "architectureRef": "representations.single_features"
        },
        {
          "id": "pair_features",
          "name": "p",
          "type": "representation",
          "shape": "B x N x N x 128",
          "representationRef": "representations.pair_features",
          "scale": "pair",
          "architectureRef": "representations.pair_features"
        },
        {
          "id": "updated_frames",
          "name": "T_hat",
          "tex": "\\hat{T}",
          "type": "representation",
          "shape": "B x N x (3 x 3 + 3)",
          "representationRef": "representations.residue_frames",
          "scale": "residue",
          "glyph": "frames",
          "architectureRef": "representations.residue_frames"
        },
        {
          "id": "predicted_noise",
          "name": "z_theta",
          "tex": "z_\\theta",
          "type": "output",
          "shape": "B x N x 3",
          "representationRef": "representations.coordinate_noise",
          "scale": "residue",
          "architectureRef": "representations.coordinate_noise"
        },
        {
          "id": "step_noise",
          "name": "z",
          "type": "input",
          "shape": "B x N x 3",
          "representationRef": "representations.coordinate_noise",
          "scale": "residue",
          "architectureRef": "representations.coordinate_noise"
        },
        {
          "id": "next_coordinates",
          "name": "x_(t-1)",
          "tex": "x_{t-1}",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.ca_coordinates",
          "scale": "residue",
          "glyph": "coordinates",
          "architectureRef": "representations.ca_coordinates"
        },
        {
          "id": "final_coordinates",
          "name": "x_0",
          "tex": "x_0",
          "type": "output",
          "shape": "B x N x 3",
          "representationRef": "representations.ca_coordinates",
          "scale": "residue",
          "glyph": "coordinates",
          "architectureRef": "representations.ca_coordinates"
        }
      ],
      "lines": [
        {
          "id": "initialize_coordinates",
          "text": "x_t = randn_like(features.atom_positions)",
          "refs": "BaseSampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "BaseSampler._sample"
            }
          ],
          "architectureRefs": [
            "modules.coordinate_initializer"
          ],
          "operation": "gaussian_coordinate_initialization",
          "inputs": [
            "feature_bundle"
          ],
          "outputs": [
            "current_coordinates"
          ]
        },
        {
          "id": "derive_current_frames",
          "text": "T_t = Frames(rotation=Frenet(x_t, chain_index, mask), translation=x_t)",
          "refs": "BaseSampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "BaseSampler._sample"
            }
          ],
          "architectureRefs": [
            "modules.frenet_frame_builder"
          ],
          "operation": "derive_frenet_frames",
          "inputs": [
            "current_coordinates",
            "feature_bundle"
          ],
          "outputs": [
            "current_frames"
          ]
        },
        {
          "id": "encode_single_state",
          "text": "s = Linear(concat(residue_pos, chain_pos, time(t), masked_motif_aatype, masks))",
          "refs": "SingleFeatureNet.forward",
          "sourceRefs": [
            {
              "source": "single_code",
              "locator": "SingleFeatureNet.forward"
            }
          ],
          "architectureRefs": [
            "modules.single_feature_net"
          ],
          "operation": "single_feature_encoding",
          "inputs": [
            "feature_bundle",
            "timestep"
          ],
          "outputs": [
            "single_features"
          ]
        },
        {
          "id": "encode_pair_state",
          "text": "p = OuterSum(s) + RelPos(features) + NoisyFrameTemplate(T_t) + MaskedMotifDistances(features)",
          "refs": "PairFeatureNet.forward",
          "sourceRefs": [
            {
              "source": "pair_code",
              "locator": "PairFeatureNet.forward"
            }
          ],
          "architectureRefs": [
            "modules.pair_feature_net",
            "claims.motif_geometry_is_intra_group"
          ],
          "operation": "pair_feature_encoding",
          "inputs": [
            "single_features",
            "current_frames",
            "feature_bundle"
          ],
          "outputs": [
            "pair_features"
          ]
        },
        {
          "id": "refine_pair_state",
          "text": "repeat 5: p += TriMulOutgoing(p); p += TriMulIncoming(p); p += PairTransition(p)",
          "refs": "PairTransformLayer.forward",
          "sourceRefs": [
            {
              "source": "pair_transform_code",
              "locator": "PairTransformLayer.forward"
            }
          ],
          "architectureRefs": [
            "modules.pair_transform_stack",
            "claims.base_model_omits_triangle_attention"
          ],
          "operation": "pair_refinement",
          "inputs": [
            "pair_features"
          ],
          "outputs": [
            "pair_features"
          ]
        },
        {
          "id": "update_structure",
          "text": "repeat 8: s = Transition(LayerNorm(s + IPA(s, p, T_t))); T_t = T_t.compose(BackboneUpdate(s))",
          "refs": "StructureLayer.forward and StructureNet.forward",
          "sourceRefs": [
            {
              "source": "structure_code",
              "locator": "StructureLayer.forward and StructureNet.forward"
            }
          ],
          "architectureRefs": [
            "modules.equivariant_structure_decoder"
          ],
          "operation": "equivariant_structure_refinement",
          "inputs": [
            "single_features",
            "pair_features",
            "current_frames"
          ],
          "outputs": [
            "updated_frames"
          ]
        },
        {
          "id": "read_noise",
          "text": "z_theta = input_frames.trans - updated_frames.trans",
          "refs": "Denoiser.forward",
          "sourceRefs": [
            {
              "source": "model_code",
              "locator": "Denoiser.forward"
            }
          ],
          "architectureRefs": [
            "modules.noise_readout"
          ],
          "operation": "translation_displacement",
          "inputs": [
            "current_frames",
            "updated_frames"
          ],
          "outputs": [
            "predicted_noise"
          ]
        },
        {
          "id": "reverse_step",
          "text": "mean = (x_t - ((1 - alpha_t) / sqrt(1 - alpha_bar_t)) * z_theta) / sqrt(alpha_t); x_(t-1) = mean if t == 1 else mean + scale * sqrt(beta_t) * z",
          "refs": "BaseSampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "BaseSampler._sample"
            }
          ],
          "architectureRefs": [
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ],
          "operation": "stochastic_ddpm_coordinate_update",
          "inputs": [
            "current_coordinates",
            "timestep",
            "predicted_noise",
            "step_noise"
          ],
          "outputs": [
            "next_coordinates"
          ]
        },
        {
          "id": "emit_backbone",
          "text": "final_coordinates = x_(t-1)  # at t = 1; serialized as C-alpha PDB records",
          "refs": "BaseSampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "BaseSampler._sample"
            }
          ],
          "architectureRefs": [
            "modules.pdb_exporter",
            "claims.model_is_sequence_agnostic"
          ],
          "operation": "emit_generated_backbone",
          "inputs": [
            "next_coordinates"
          ],
          "outputs": [
            "final_coordinates"
          ]
        }
      ],
      "claims": [
        {
          "id": "denoiser_and_sampler_are_separate",
          "statement": "The learned denoiser predicts coordinate noise; the posterior mean, stochastic noise term, and frame reconstruction are fixed sampler operations outside the model.",
          "line_refs": [
            "derive_current_frames",
            "read_noise",
            "reverse_step"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_model_code",
                "role": "implementation_evidence",
                "locator": "Denoiser.forward"
              },
              {
                "source_ref": "genie2_sampler_code",
                "role": "implementation_evidence",
                "locator": "BaseSampler._sample"
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/genie2.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/genie2-semantic-zoom.view.yaml",
    "rootBoard": "generation_overview",
    "items": [
      {
        "id": "generation_overview",
        "title": "Genie 2 Backbone Generation",
        "summary": "A target length or motif specification becomes a reusable conditioning bundle; Genie 2 denoises random C-alpha coordinates, then exports the sequence-agnostic backbone as PDB records.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "generation_request",
            "ref": "value_sites.generation_request",
            "label": "generation request",
            "notation": "length / motif PDB",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "vector",
            "col": 1,
            "row": 2
          },
          {
            "id": "feature_builder",
            "ref": "modules.feature_builder",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 3,
            "row": 2
          },
          {
            "id": "reverse_diffusion_sampler",
            "ref": "modules.reverse_diffusion_sampler",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "sampling_loop"
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "generated C-alpha coordinates",
            "notation": "x_0",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "pdb_exporter",
            "ref": "modules.pdb_exporter",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          },
          {
            "id": "generated_backbone_pdb",
            "ref": "value_sites.generated_backbone_pdb",
            "label": "backbone PDB",
            "notation": ".pdb",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "matrix",
            "col": 7,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.single_feature_net",
            "reason": "The task overview carries the feature bundle into the sampler once; its sequence-conditioning use is expanded on the denoiser and invariant-encoder boards."
          },
          {
            "ref": "modules.pair_feature_net",
            "reason": "The task overview suppresses the separate internal pair-geometry use so it does not become a duplicate feature-to-sampler wire."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Residue-mask use inside IPA belongs to the structure-decoder detail rather than the task overview."
          },
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet construction is expanded inside the sampling loop; the task overview keeps one feature-to-sampler connection."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.generation_request_enters_feature_builder"
            },
            "label": "mode + size",
            "connection": {
              "title": "Generation request",
              "role": "task boundary input",
              "inside": "Unconditional generation supplies a target length; scaffolding supplies a motif PDB specification that also determines scaffold placement ranges."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_builder_produces_feature_bundle"
            },
            "label": "masks + constraints",
            "tone": "conditioning",
            "connection": {
              "title": "Prepared sampling features",
              "role": "cached conditioning",
              "inside": "The builder prepares residue and chain indices, masks, and optional motif sequence and intra-motif geometry constraints once for the full reverse chain."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
            },
            "label": "1000 reverse steps",
            "connection": {
              "title": "Features enter reverse diffusion",
              "role": "sampling context",
              "inside": "The feature bundle fixes the number of residues and remains read-only while the sampler repeatedly updates C-alpha coordinates."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "x_0",
            "connection": {
              "title": "Terminal coordinates",
              "role": "sampler output",
              "inside": "After the step-one posterior mean, the terminal C-alpha coordinate trace becomes the generated backbone."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_coordinates_enter_pdb_exporter"
            },
            "label": "C-alpha trace",
            "connection": {
              "title": "Coordinates to exporter",
              "role": "output serialization",
              "inside": "The exporter receives geometry, not a newly designed amino-acid sequence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pdb_exporter_writes_backbone_pdb"
            },
            "label": "PDB records",
            "connection": {
              "title": "Generated backbone PDB",
              "role": "task boundary output",
              "inside": "Scaffold residues use alanine placeholders; fixed motif identities can be retained from the conditioning input."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_e8504796740e",
            "from": "feature_builder",
            "to": "feature_bundle",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.feature_builder_produces_feature_bundle"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_builder_produces_feature_bundle"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "masks + constraints",
              "tone": "conditioning",
              "connection": {
                "title": "Prepared sampling features",
                "role": "cached conditioning",
                "inside": "The builder prepares residue and chain indices, masks, and optional motif sequence and intra-motif geometry constraints once for the full reverse chain."
              }
            }
          },
          {
            "id": "projection_c7665c3a6e7e",
            "from": "feature_bundle",
            "to": "reverse_diffusion_sampler",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sets_initial_coordinate_shape"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "1000 reverse steps",
              "connection": {
                "title": "Features enter reverse diffusion",
                "role": "sampling context",
                "inside": "The feature bundle fixes the number of residues and remains read-only while the sampler repeatedly updates C-alpha coordinates."
              }
            }
          },
          {
            "id": "projection_a3ff675098b6",
            "from": "final_coordinates",
            "to": "pdb_exporter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.final_coordinates_enter_pdb_exporter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_coordinates_enter_pdb_exporter"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "C-alpha trace",
              "connection": {
                "title": "Coordinates to exporter",
                "role": "output serialization",
                "inside": "The exporter receives geometry, not a newly designed amino-acid sequence."
              }
            }
          },
          {
            "id": "projection_7abfccb36c40",
            "from": "generation_request",
            "to": "feature_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.generation_request_enters_feature_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.generation_request_enters_feature_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.generation_request"
            ],
            "presentation": {
              "label": "mode + size",
              "connection": {
                "title": "Generation request",
                "role": "task boundary input",
                "inside": "Unconditional generation supplies a target length; scaffolding supplies a motif PDB specification that also determines scaffold placement ranges."
              }
            }
          },
          {
            "id": "projection_f3e38678d163",
            "from": "pdb_exporter",
            "to": "generated_backbone_pdb",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pdb_exporter_writes_backbone_pdb"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pdb_exporter_writes_backbone_pdb"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.backbone_pdb"
            ],
            "presentation": {
              "label": "PDB records",
              "connection": {
                "title": "Generated backbone PDB",
                "role": "task boundary output",
                "inside": "Scaffold residues use alanine placeholders; fixed motif identities can be retained from the conditioning input."
              }
            }
          },
          {
            "id": "projection_d6733af11b05",
            "from": "reverse_diffusion_sampler",
            "to": "final_coordinates",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.terminal_coordinates_become_final_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_0",
              "connection": {
                "title": "Terminal coordinates",
                "role": "sampler output",
                "inside": "After the step-one posterior mean, the terminal C-alpha coordinate trace becomes the generated backbone."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "collapsed:modules.reverse_diffusion_sampler",
          "modules.coordinate_initializer": "collapsed:modules.reverse_diffusion_sampler",
          "modules.feature_builder": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.reverse_diffusion_sampler",
          "modules.pair_feature_net": "excluded",
          "modules.pair_transition": "collapsed:modules.reverse_diffusion_sampler",
          "modules.pdb_exporter": "visible",
          "modules.reverse_diffusion_sampler": "visible",
          "modules.reverse_diffusion_update": "collapsed:modules.reverse_diffusion_sampler",
          "modules.single_feature_net": "excluded",
          "modules.step_noise_sampler": "collapsed:modules.reverse_diffusion_sampler",
          "modules.structure_transition": "collapsed:modules.reverse_diffusion_sampler",
          "modules.timestep_controller": "collapsed:modules.reverse_diffusion_sampler",
          "modules.triangle_multiplication_incoming": "collapsed:modules.reverse_diffusion_sampler",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.current_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.current_frames": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.generated_backbone_pdb": "visible",
          "value_sites.generation_request": "visible",
          "value_sites.initial_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.initial_pair_features": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.next_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.pair_after_incoming": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.pair_after_outgoing": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.predicted_noise": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.refined_pair_features": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.single_after_ipa": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.single_after_transition": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.timestep": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.updated_frames": "collapsed:modules.reverse_diffusion_sampler"
        },
        "projectionMode": "derived"
      },
      {
        "id": "sampling_loop",
        "title": "1000-Step Reverse Diffusion",
        "summary": "Random C-alpha coordinates initialize x_T. Each step derives Frenet frames from x_t for the denoiser, then fixed DDPM math updates only the coordinates to x_(t-1).",
        "parent": "generation_overview",
        "subject_ref": "modules.reverse_diffusion_sampler",
        "expansion_depth": 1,
        "grid": {
          "columns": 8,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 42
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "cached features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "coordinate_initializer",
            "ref": "modules.coordinate_initializer",
            "label": "Gaussian coordinate initializer",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "current_coordinates",
            "ref": "value_sites.current_coordinates",
            "label": "current noisy C-alpha coordinates",
            "notation": "x_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "timestep_controller",
            "ref": "modules.timestep_controller",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 3,
            "row": 1
          },
          {
            "id": "frenet_frame_builder",
            "ref": "modules.frenet_frame_builder",
            "label": "derive Frenet frames",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "denoiser",
            "ref": "modules.denoiser",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3,
            "board_ref": "denoiser_forward"
          },
          {
            "id": "predicted_noise",
            "ref": "value_sites.predicted_noise",
            "label": "predicted coordinate noise",
            "notation": "z_theta",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 5,
            "row": 3
          },
          {
            "id": "step_noise_sampler",
            "ref": "modules.step_noise_sampler",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 1
          },
          {
            "id": "fresh_step_noise",
            "ref": "value_sites.fresh_step_noise",
            "label": "fresh step noise",
            "notation": "z",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "matrix",
            "col": 6,
            "row": 1
          },
          {
            "id": "reverse_diffusion_update",
            "ref": "modules.reverse_diffusion_update",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 3
          },
          {
            "id": "next_coordinates",
            "ref": "value_sites.next_coordinates",
            "label": "next C-alpha coordinates",
            "notation": "x_{t-1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "final C-alpha coordinates",
            "notation": "x_0",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 3
          }
        ],
        "elide": [
          {
            "ref": "value_sites.initial_coordinates"
          },
          {
            "ref": "value_sites.current_frames"
          }
        ],
        "exclude": [
          {
            "ref": "modules.pair_feature_net",
            "reason": "The sampling-loop board represents all learned uses of x_t through one denoiser wire; noisy pair geometry is expanded on the invariant-encoder board."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Frame-point conditioning and residue masking are internal to the structure decoder and are expanded on its child board."
          },
          {
            "ref": "modules.backbone_update",
            "reason": "Frame composition is internal to the structure decoder; suppressing it here keeps one derived-frames-to-denoiser wire."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
            },
            "label": "N residues",
            "tone": "conditioning",
            "connection": {
              "title": "Requested shape",
              "role": "initialization context",
              "inside": "The residue mask fixes the coordinate tensor shape before standard-normal translations are sampled."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.coordinate_initializer_produces_initial_coordinates",
                "relations.initial_coordinates_begin_sampling_state"
              ]
            },
            "label": "Gaussian x_T",
            "connection": {
              "title": "Initial random trace",
              "role": "reverse-chain initialization",
              "inside": "The sampler draws one standard-normal C-alpha coordinate for every residue; these coordinates are the initial diffusion state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_coordinates_enter_frenet_frame_builder"
            },
            "label": "x_t",
            "connection": {
              "title": "Current coordinate trace",
              "role": "derived-geometry input",
              "inside": "The current stochastic state is the B by N by 3 C-alpha trace, not a separately sampled set of rotations."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_frenet_frame_builder"
            },
            "label": "chain + mask",
            "tone": "conditioning",
            "connection": {
              "title": "Frame-construction context",
              "role": "chain-aware geometric derivation",
              "inside": "Chain indices and the residue mask determine which neighboring coordinates define each Frenet rotation."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.frenet_frame_builder_produces_current_frames",
                "relations.current_frames_enter_noise_readout"
              ]
            },
            "label": "derived T(x_t)",
            "connection": {
              "title": "Derived frames to denoiser",
              "role": "geometric model input",
              "inside": "The denoiser receives x_t packaged with Frenet rotations computed deterministically from that same coordinate trace."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_controller_produces_timestep"
            },
            "label": "1000 → 1",
            "tone": "conditioning",
            "connection": {
              "title": "Reverse timestep",
              "role": "loop control",
              "inside": "The controller selects one schedule index for both the denoiser and posterior update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "cached features",
            "tone": "conditioning",
            "connection": {
              "title": "Cached features to denoiser",
              "role": "read-only model context",
              "inside": "The denoiser receives the prepared residue layout and optional motif constraints at every reverse step."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "t",
            "tone": "conditioning",
            "connection": {
              "title": "Timestep to denoiser",
              "role": "noise-level conditioning",
              "inside": "The denoiser embeds the current reverse index into its per-residue single state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_coordinates_enter_reverse_update"
            },
            "label": "x_t",
            "connection": {
              "title": "Current coordinates to DDPM update",
              "role": "reverse-process state",
              "inside": "The fixed posterior equation combines the current C-alpha coordinates with the denoiser prediction and schedule coefficients."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_readout_produces_predicted_noise"
            },
            "label": "z_theta",
            "connection": {
              "title": "Predicted coordinate noise",
              "role": "learned reverse-process parameter",
              "inside": "The model outputs one three-vector per residue; it does not directly perform the DDPM posterior update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.fresh_noise_enters_reverse_update"
            },
            "label": "scale · sigma_t · z",
            "connection": {
              "title": "Stochastic step term",
              "role": "reverse-step randomness",
              "inside": "Fresh Gaussian noise is added on steps above one; the last update uses only the posterior mean."
            }
          },
          {
            "match": {
              "relation_ref": "relations.reverse_update_produces_next_coordinates"
            },
            "label": "posterior update",
            "connection": {
              "title": "Next reverse state",
              "role": "fixed sampler math",
              "inside": "Schedule coefficients and, above step one, fresh Gaussian noise produce the next C-alpha coordinate trace."
            }
          },
          {
            "match": {
              "relation_ref": "relations.next_coordinates_reenter_sampling_state"
            },
            "label": "next iteration",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 52,
            "connection": {
              "title": "Reverse-chain recurrence",
              "role": "loop state update",
              "inside": "The newly sampled C-alpha coordinates become x_t for the following, lower timestep; Frenet frames are then derived again."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "when t = 1",
            "connection": {
              "title": "Sampling termination",
              "role": "final state selection",
              "inside": "The step-one mean is exposed as the generated backbone coordinate trace."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_588713236286",
            "from": "coordinate_initializer",
            "to": "current_coordinates",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.coordinate_initializer_produces_initial_coordinates",
              "relations.initial_coordinates_begin_sampling_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.coordinate_initializer_produces_initial_coordinates"
              },
              {
                "relation_ref": "relations.initial_coordinates_begin_sampling_state"
              }
            ],
            "hidden_refs": [
              "value_sites.initial_coordinates"
            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "Gaussian x_T",
              "connection": {
                "title": "Initial random trace",
                "role": "reverse-chain initialization",
                "inside": "The sampler draws one standard-normal C-alpha coordinate for every residue; these coordinates are the initial diffusion state."
              }
            }
          },
          {
            "id": "projection_4c0f3c51159c",
            "from": "current_coordinates",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_coordinates_enter_frenet_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_coordinates_enter_frenet_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current coordinate trace",
                "role": "derived-geometry input",
                "inside": "The current stochastic state is the B by N by 3 C-alpha trace, not a separately sampled set of rotations."
              }
            }
          },
          {
            "id": "projection_0683257732ca",
            "from": "current_coordinates",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_coordinates_enter_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_coordinates_enter_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current coordinates to DDPM update",
                "role": "reverse-process state",
                "inside": "The fixed posterior equation combines the current C-alpha coordinates with the denoiser prediction and schedule coefficients."
              }
            }
          },
          {
            "id": "projection_2d5bc6d7ef90",
            "from": "denoiser",
            "to": "predicted_noise",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.noise_readout_produces_predicted_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.noise_readout_produces_predicted_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "z_theta",
              "connection": {
                "title": "Predicted coordinate noise",
                "role": "learned reverse-process parameter",
                "inside": "The model outputs one three-vector per residue; it does not directly perform the DDPM posterior update."
              }
            }
          },
          {
            "id": "projection_30a8d9196e4f",
            "from": "feature_bundle",
            "to": "coordinate_initializer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sets_initial_coordinate_shape"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "N residues",
              "tone": "conditioning",
              "connection": {
                "title": "Requested shape",
                "role": "initialization context",
                "inside": "The residue mask fixes the coordinate tensor shape before standard-normal translations are sampled."
              }
            }
          },
          {
            "id": "projection_6596a37b56d8",
            "from": "feature_bundle",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "cached features",
              "tone": "conditioning",
              "connection": {
                "title": "Cached features to denoiser",
                "role": "read-only model context",
                "inside": "The denoiser receives the prepared residue layout and optional motif constraints at every reverse step."
              }
            }
          },
          {
            "id": "projection_826c1250fe7b",
            "from": "feature_bundle",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_frenet_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_frenet_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "chain + mask",
              "tone": "conditioning",
              "connection": {
                "title": "Frame-construction context",
                "role": "chain-aware geometric derivation",
                "inside": "Chain indices and the residue mask determine which neighboring coordinates define each Frenet rotation."
              }
            }
          },
          {
            "id": "projection_a1e5fc30349b",
            "from": "frenet_frame_builder",
            "to": "denoiser",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.frenet_frame_builder_produces_current_frames",
              "relations.current_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.frenet_frame_builder_produces_current_frames"
              },
              {
                "relation_ref": "relations.current_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [
              "value_sites.current_frames"
            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "derived T(x_t)",
              "connection": {
                "title": "Derived frames to denoiser",
                "role": "geometric model input",
                "inside": "The denoiser receives x_t packaged with Frenet rotations computed deterministically from that same coordinate trace."
              }
            }
          },
          {
            "id": "projection_e9de4dbb5f4f",
            "from": "fresh_step_noise",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.fresh_noise_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.fresh_noise_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "scale · sigma_t · z",
              "connection": {
                "title": "Stochastic step term",
                "role": "reverse-step randomness",
                "inside": "Fresh Gaussian noise is added on steps above one; the last update uses only the posterior mean."
              }
            }
          },
          {
            "id": "projection_78bbb80c24c9",
            "from": "next_coordinates",
            "to": "current_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.next_coordinates_reenter_sampling_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.next_coordinates_reenter_sampling_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "next iteration",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 52,
              "connection": {
                "title": "Reverse-chain recurrence",
                "role": "loop state update",
                "inside": "The newly sampled C-alpha coordinates become x_t for the following, lower timestep; Frenet frames are then derived again."
              }
            }
          },
          {
            "id": "projection_bc3b2cb9c02f",
            "from": "next_coordinates",
            "to": "final_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.terminal_coordinates_become_final_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "when t = 1",
              "connection": {
                "title": "Sampling termination",
                "role": "final state selection",
                "inside": "The step-one mean is exposed as the generated backbone coordinate trace."
              }
            }
          },
          {
            "id": "projection_a3be2644eb0b",
            "from": "predicted_noise",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.predicted_noise_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.predicted_noise_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_e5b20f614e21",
            "from": "reverse_diffusion_update",
            "to": "next_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.reverse_update_produces_next_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.reverse_update_produces_next_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "posterior update",
              "connection": {
                "title": "Next reverse state",
                "role": "fixed sampler math",
                "inside": "Schedule coefficients and, above step one, fresh Gaussian noise produce the next C-alpha coordinate trace."
              }
            }
          },
          {
            "id": "projection_85240a6d0eca",
            "from": "step_noise_sampler",
            "to": "fresh_step_noise",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.step_noise_sampler_produces_fresh_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.step_noise_sampler_produces_fresh_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_0b977f8cbc32",
            "from": "timestep",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "t",
              "tone": "conditioning",
              "connection": {
                "title": "Timestep to denoiser",
                "role": "noise-level conditioning",
                "inside": "The denoiser embeds the current reverse index into its per-residue single state."
              }
            }
          },
          {
            "id": "projection_3d074870d011",
            "from": "timestep",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f8f49300f3a2",
            "from": "timestep_controller",
            "to": "timestep",
            "projection": "direct",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_controller_produces_timestep"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_controller_produces_timestep"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "1000 → 1",
              "tone": "conditioning",
              "connection": {
                "title": "Reverse timestep",
                "role": "loop control",
                "inside": "The controller selects one schedule index for both the denoiser and posterior update."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "excluded",
          "modules.coordinate_initializer": "visible",
          "modules.denoiser": "visible",
          "modules.frenet_frame_builder": "visible",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.denoiser",
          "modules.pair_feature_net": "excluded",
          "modules.pair_transition": "collapsed:modules.denoiser",
          "modules.reverse_diffusion_update": "visible",
          "modules.single_feature_net": "collapsed:modules.denoiser",
          "modules.step_noise_sampler": "visible",
          "modules.structure_transition": "collapsed:modules.denoiser",
          "modules.timestep_controller": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.denoiser",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.denoiser",
          "value_sites.current_coordinates": "visible",
          "value_sites.current_frames": "elided",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "visible",
          "value_sites.initial_coordinates": "elided",
          "value_sites.initial_pair_features": "collapsed:modules.denoiser",
          "value_sites.next_coordinates": "visible",
          "value_sites.pair_after_incoming": "collapsed:modules.denoiser",
          "value_sites.pair_after_outgoing": "collapsed:modules.denoiser",
          "value_sites.predicted_noise": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.denoiser",
          "value_sites.single_after_ipa": "collapsed:modules.denoiser",
          "value_sites.single_after_transition": "collapsed:modules.denoiser",
          "value_sites.single_features": "collapsed:modules.denoiser",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "collapsed:modules.denoiser"
        },
        "projectionMode": "derived"
      },
      {
        "id": "denoiser_forward",
        "title": "Genie 2 Denoiser Forward Pass",
        "summary": "The denoiser receives T(x_t), which packages noisy C-alpha translations with Frenet rotations derived from x_t. It encodes invariant geometry, updates frames equivariantly, and reads their translation displacement as predicted noise.",
        "parent": "sampling_loop",
        "subject_ref": "modules.denoiser",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 48
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 1,
            "row": 2
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "invariant_feature_encoder",
            "ref": "modules.invariant_feature_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2,
            "board_ref": "invariant_feature_encoder"
          },
          {
            "id": "equivariant_structure_decoder",
            "ref": "modules.equivariant_structure_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4,
            "board_ref": "structure_decoder"
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.updated_frames",
            "label": "updated frame estimate",
            "notation": "T_hat",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "noise_readout",
            "ref": "modules.noise_readout",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 4
          },
          {
            "id": "predicted_noise",
            "ref": "value_sites.predicted_noise",
            "label": "predicted coordinate noise",
            "notation": "z_theta = trans(T_t) - trans(T_hat)",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 7,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "The parent sampling board owns the deterministic construction of the denoiser's T(x_t) input."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "layout + motif sequence",
            "tone": "conditioning",
            "connection": {
              "title": "Feature bundle to invariant encoder",
              "role": "sequence-side conditioning",
              "inside": "Residue and chain indices, timestep-independent masks, and fixed motif identities are projected into the per-residue state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
            },
            "label": "motif geometry",
            "tone": "conditioning",
            "route_side": "top",
            "route_clearance": 28,
            "connection": {
              "title": "Motif geometry to pair encoder",
              "role": "pair-side conditioning",
              "inside": "Fixed intra-motif C-alpha distances are injected into pair features while unspecified scaffold and inter-motif geometry remains free."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "time encoding",
            "tone": "conditioning",
            "connection": {
              "title": "Diffusion time",
              "role": "noise-level conditioning",
              "inside": "A sinusoidal timestep code is repeated over residues and concatenated into the single-feature input."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_pair_feature_net"
            },
            "label": "distances + orientations",
            "connection": {
              "title": "Noisy geometry into invariant encoding",
              "role": "current-structure observation",
              "inside": "Pairwise distances and relative frame orientations describe x_t without fixing a global pose."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_features_enter_ipa"
            },
            "label": "single state",
            "connection": {
              "title": "Single state to structure decoder",
              "role": "mutable residue state",
              "inside": "The invariant per-residue state supplies IPA queries and the features used to regress each rigid update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_pair_features_bias_ipa"
            },
            "label": "refined pair state",
            "tone": "conditioning",
            "route_side": "top",
            "route_clearance": 42,
            "connection": {
              "title": "Pair state to structure decoder",
              "role": "attention context",
              "inside": "Refined residue-pair features condition IPA while remaining fixed across the eight structure layers."
            }
          },
          {
            "match": {
              "relation_ref": "relations.backbone_update_produces_updated_frames"
            },
            "label": "8 equivariant updates",
            "connection": {
              "title": "Updated residue frames",
              "role": "decoder estimate",
              "inside": "Each structure layer composes a learned rigid increment; the eighth layer returns the final frame estimate for this denoiser call."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_noise_readout"
            },
            "label": "noisy translations",
            "route_side": "bottom",
            "route_clearance": 34,
            "connection": {
              "title": "Input side of displacement",
              "role": "noise readout minuend",
              "inside": "The original x_t translations are retained so the decoder displacement can be converted to the noise convention used by the DDPM loss."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_frames_enter_noise_readout"
            },
            "label": "estimated clean direction",
            "connection": {
              "title": "Updated side of displacement",
              "role": "noise readout subtrahend",
              "inside": "Updated frame translations are subtracted from the original noisy translations."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_readout_produces_predicted_noise"
            },
            "label": "coordinate difference",
            "connection": {
              "title": "Denoiser output",
              "role": "predicted diffusion noise",
              "inside": "The resulting B by N by 3 field is consumed by the fixed reverse-diffusion equation on the parent board."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_c406a0443cee",
            "from": "current_frames",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_condition_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a0f4e2ef4a06",
            "from": "current_frames",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_enter_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_7699306d8e75",
            "from": "current_frames",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "distances + orientations",
              "connection": {
                "title": "Noisy geometry into invariant encoding",
                "role": "current-structure observation",
                "inside": "Pairwise distances and relative frame orientations describe x_t without fixing a global pose."
              }
            }
          },
          {
            "id": "projection_c542927b6731",
            "from": "current_frames",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "noisy translations",
              "route_side": "bottom",
              "route_clearance": 34,
              "connection": {
                "title": "Input side of displacement",
                "role": "noise readout minuend",
                "inside": "The original x_t translations are retained so the decoder displacement can be converted to the noise convention used by the DDPM loss."
              }
            }
          },
          {
            "id": "projection_172961c8e836",
            "from": "equivariant_structure_decoder",
            "to": "updated_frames",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.backbone_update_produces_updated_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.backbone_update_produces_updated_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "8 equivariant updates",
              "connection": {
                "title": "Updated residue frames",
                "role": "decoder estimate",
                "inside": "Each structure layer composes a learned rigid increment; the eighth layer returns the final frame estimate for this denoiser call."
              }
            }
          },
          {
            "id": "projection_615ffdd84e91",
            "from": "feature_bundle",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_masks_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_masks_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_4dc559d7f039",
            "from": "feature_bundle",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "motif geometry",
              "tone": "conditioning",
              "route_side": "top",
              "route_clearance": 28,
              "connection": {
                "title": "Motif geometry to pair encoder",
                "role": "pair-side conditioning",
                "inside": "Fixed intra-motif C-alpha distances are injected into pair features while unspecified scaffold and inter-motif geometry remains free."
              }
            }
          },
          {
            "id": "projection_450cc34c1675",
            "from": "feature_bundle",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "layout + motif sequence",
              "tone": "conditioning",
              "connection": {
                "title": "Feature bundle to invariant encoder",
                "role": "sequence-side conditioning",
                "inside": "Residue and chain indices, timestep-independent masks, and fixed motif identities are projected into the per-residue state."
              }
            }
          },
          {
            "id": "projection_b8233429d366",
            "from": "invariant_feature_encoder",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_pair_features_bias_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "refined pair state",
              "tone": "conditioning",
              "route_side": "top",
              "route_clearance": 42,
              "connection": {
                "title": "Pair state to structure decoder",
                "role": "attention context",
                "inside": "Refined residue-pair features condition IPA while remaining fixed across the eight structure layers."
              }
            }
          },
          {
            "id": "projection_3890adb87cdd",
            "from": "invariant_feature_encoder",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_enter_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "single state",
              "connection": {
                "title": "Single state to structure decoder",
                "role": "mutable residue state",
                "inside": "The invariant per-residue state supplies IPA queries and the features used to regress each rigid update."
              }
            }
          },
          {
            "id": "projection_920cff6f5a3a",
            "from": "noise_readout",
            "to": "predicted_noise",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.noise_readout_produces_predicted_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.noise_readout_produces_predicted_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "coordinate difference",
              "connection": {
                "title": "Denoiser output",
                "role": "predicted diffusion noise",
                "inside": "The resulting B by N by 3 field is consumed by the fixed reverse-diffusion equation on the parent board."
              }
            }
          },
          {
            "id": "projection_4dffa3c9a6d9",
            "from": "timestep",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "time encoding",
              "tone": "conditioning",
              "connection": {
                "title": "Diffusion time",
                "role": "noise-level conditioning",
                "inside": "A sinusoidal timestep code is repeated over residues and concatenated into the single-feature input."
              }
            }
          },
          {
            "id": "projection_0e9190d9aab1",
            "from": "updated_frames",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.updated_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "estimated clean direction",
              "connection": {
                "title": "Updated side of displacement",
                "role": "noise readout subtrahend",
                "inside": "Updated frame translations are subtracted from the original noisy translations."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "collapsed:modules.equivariant_structure_decoder",
          "modules.equivariant_structure_decoder": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_feature_encoder": "visible",
          "modules.invariant_point_attention": "collapsed:modules.equivariant_structure_decoder",
          "modules.noise_readout": "visible",
          "modules.pair_feature_net": "collapsed:modules.invariant_feature_encoder",
          "modules.pair_transition": "collapsed:modules.invariant_feature_encoder",
          "modules.single_feature_net": "collapsed:modules.invariant_feature_encoder",
          "modules.structure_transition": "collapsed:modules.equivariant_structure_decoder",
          "modules.triangle_multiplication_incoming": "collapsed:modules.invariant_feature_encoder",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.invariant_feature_encoder",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.initial_pair_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.pair_after_incoming": "collapsed:modules.invariant_feature_encoder",
          "value_sites.pair_after_outgoing": "collapsed:modules.invariant_feature_encoder",
          "value_sites.predicted_noise": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.single_after_ipa": "collapsed:modules.equivariant_structure_decoder",
          "value_sites.single_after_transition": "collapsed:modules.equivariant_structure_decoder",
          "value_sites.single_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "invariant_feature_encoder",
        "title": "SE(3)-Invariant Feature Encoder",
        "summary": "The encoder first forms a residue state, expands it into a pair state enriched with current and motif geometry, then applies five active Evoformer-style pair-refinement layers.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.invariant_feature_encoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 1,
            "row": 3
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 5
          },
          {
            "id": "single_feature_net",
            "ref": "modules.single_feature_net",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2
          },
          {
            "id": "single_features",
            "ref": "value_sites.single_features",
            "label": "single features",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_feature_net",
            "ref": "modules.pair_feature_net",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4
          },
          {
            "id": "initial_pair_features",
            "ref": "value_sites.initial_pair_features",
            "label": "initial pair features",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 5,
            "row": 4
          },
          {
            "id": "pair_transform_stack",
            "ref": "modules.pair_transform_stack",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 4,
            "board_ref": "pair_transform_stack"
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "refined pair features",
            "notation": "p_refined",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 7,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet frames enter this child board as an already-derived denoiser input from the sampling board."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "The invariant encoder board stops at the single and refined-pair outputs; IPA is expanded on the sibling structure-decoder board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "residue/chain + motif AA",
            "tone": "conditioning",
            "connection": {
              "title": "Single-feature ingredients",
              "role": "per-residue conditioning",
              "inside": "Residue index, chain index, masked motif identities, and masks are concatenated with the repeated timestep code."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "sinusoidal t",
            "tone": "conditioning",
            "connection": {
              "title": "Timestep embedding",
              "role": "per-residue noise level",
              "inside": "One diffusion index is sinusoidally encoded and repeated across all residues."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_feature_net_produces_single_features"
            },
            "label": "B × N × 384",
            "connection": {
              "title": "Single representation",
              "role": "invariant residue state",
              "inside": "A single linear projection produces the 384-channel state used by both pair construction and the structure decoder."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_features_feed_pair_feature_net"
            },
            "label": "outer sum s_i + s_j",
            "connection": {
              "title": "Residue-to-pair expansion",
              "role": "initialize pair channels",
              "inside": "Separate linear projections of residue i and residue j are added across every ordered residue pair."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_pair_feature_net"
            },
            "label": "noisy d_ij + q_ij",
            "connection": {
              "title": "Current geometry",
              "role": "invariant frame template",
              "inside": "Binned C-alpha distances and relative orientation quaternions encode the noisy structure without a global-coordinate dependence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
            },
            "label": "relpos + motif d_ij",
            "tone": "conditioning",
            "connection": {
              "title": "Layout and motif geometry",
              "role": "pair conditioning",
              "inside": "Relative sequence offsets and same-chain flags are always present; motif distances are included only where fixed_structure_mask is true."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_feature_net_produces_initial_pair_features"
            },
            "label": "B × N × N × 128",
            "connection": {
              "title": "Initial pair state",
              "role": "pair-refinement input",
              "inside": "Projected outer-sum, layout, current-frame, and motif-template terms are summed and masked."
            }
          },
          {
            "match": {
              "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
            },
            "label": "×5 layers",
            "connection": {
              "title": "Pair refinement",
              "role": "active base-checkpoint stack",
              "inside": "Each layer applies outgoing multiplication, incoming multiplication, and a pair transition; triangular attention is disabled in the released base configuration."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_produces_refined_pair_features"
            },
            "label": "refined p",
            "connection": {
              "title": "Refined pair state",
              "role": "structure-decoder context",
              "inside": "The final pair state is held fixed while eight equivariant structure layers update residue frames."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_858f2065e17b",
            "from": "current_frames",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "noisy d_ij + q_ij",
              "connection": {
                "title": "Current geometry",
                "role": "invariant frame template",
                "inside": "Binned C-alpha distances and relative orientation quaternions encode the noisy structure without a global-coordinate dependence."
              }
            }
          },
          {
            "id": "projection_dff392d3ff3f",
            "from": "feature_bundle",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "relpos + motif d_ij",
              "tone": "conditioning",
              "connection": {
                "title": "Layout and motif geometry",
                "role": "pair conditioning",
                "inside": "Relative sequence offsets and same-chain flags are always present; motif distances are included only where fixed_structure_mask is true."
              }
            }
          },
          {
            "id": "projection_ab2bef7d07cf",
            "from": "feature_bundle",
            "to": "single_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "residue/chain + motif AA",
              "tone": "conditioning",
              "connection": {
                "title": "Single-feature ingredients",
                "role": "per-residue conditioning",
                "inside": "Residue index, chain index, masked motif identities, and masks are concatenated with the repeated timestep code."
              }
            }
          },
          {
            "id": "projection_cbb60e8f1043",
            "from": "initial_pair_features",
            "to": "pair_transform_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_features_enter_outgoing_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "×5 layers",
              "connection": {
                "title": "Pair refinement",
                "role": "active base-checkpoint stack",
                "inside": "Each layer applies outgoing multiplication, incoming multiplication, and a pair transition; triangular attention is disabled in the released base configuration."
              }
            }
          },
          {
            "id": "projection_aa982bed16de",
            "from": "pair_feature_net",
            "to": "initial_pair_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_feature_net_produces_initial_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_feature_net_produces_initial_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "B × N × N × 128",
              "connection": {
                "title": "Initial pair state",
                "role": "pair-refinement input",
                "inside": "Projected outer-sum, layout, current-frame, and motif-template terms are summed and masked."
              }
            }
          },
          {
            "id": "projection_dc45f38423b2",
            "from": "pair_transform_stack",
            "to": "refined_pair_features",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_produces_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_produces_refined_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "refined p",
              "connection": {
                "title": "Refined pair state",
                "role": "structure-decoder context",
                "inside": "The final pair state is held fixed while eight equivariant structure layers update residue frames."
              }
            }
          },
          {
            "id": "projection_0fa3a065066c",
            "from": "single_feature_net",
            "to": "single_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_feature_net_produces_single_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_feature_net_produces_single_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "B × N × 384",
              "connection": {
                "title": "Single representation",
                "role": "invariant residue state",
                "inside": "A single linear projection produces the 384-channel state used by both pair construction and the structure decoder."
              }
            }
          },
          {
            "id": "projection_ddea5baf5f8d",
            "from": "single_features",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_feed_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_feed_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "outer sum s_i + s_j",
              "connection": {
                "title": "Residue-to-pair expansion",
                "role": "initialize pair channels",
                "inside": "Separate linear projections of residue i and residue j are added across every ordered residue pair."
              }
            }
          },
          {
            "id": "projection_8f22f5cab186",
            "from": "timestep",
            "to": "single_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "sinusoidal t",
              "tone": "conditioning",
              "connection": {
                "title": "Timestep embedding",
                "role": "per-residue noise level",
                "inside": "One diffusion index is sinusoidally encoded and repeated across all residues."
              }
            }
          }
        ],
        "classifications": {
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "excluded",
          "modules.pair_feature_net": "visible",
          "modules.pair_transform_stack": "visible",
          "modules.pair_transition": "collapsed:modules.pair_transform_stack",
          "modules.single_feature_net": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pair_transform_stack",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pair_transform_stack",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.initial_pair_features": "visible",
          "value_sites.pair_after_incoming": "collapsed:modules.pair_transform_stack",
          "value_sites.pair_after_outgoing": "collapsed:modules.pair_transform_stack",
          "value_sites.refined_pair_features": "visible",
          "value_sites.single_features": "visible",
          "value_sites.timestep": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pair_transform_stack",
        "title": "One Pair Transform Layer (Repeated ×5)",
        "summary": "Each active base-model layer applies outgoing and incoming triangular multiplicative residual updates, then a pair-wise transition MLP. Triangular attention exists in code but is disabled by configuration.",
        "parent": "invariant_feature_encoder",
        "subject_ref": "modules.pair_transform_stack",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 44
        },
        "nodes": [
          {
            "id": "initial_pair_features",
            "ref": "value_sites.initial_pair_features",
            "label": "pair state in",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 2
          },
          {
            "id": "triangle_multiplication_outgoing",
            "ref": "modules.triangle_multiplication_outgoing",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "pair_after_outgoing",
            "ref": "value_sites.pair_after_outgoing",
            "label": "after outgoing update",
            "notation": "p + Delta_out",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 3,
            "row": 2
          },
          {
            "id": "triangle_multiplication_incoming",
            "ref": "modules.triangle_multiplication_incoming",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_after_incoming",
            "ref": "value_sites.pair_after_incoming",
            "label": "after incoming update",
            "notation": "p + Delta_in",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 5,
            "row": 2
          },
          {
            "id": "pair_transition",
            "ref": "modules.pair_transition",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "pair state out",
            "notation": "p'",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 7,
            "row": 2
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
            },
            "label": "p",
            "connection": {
              "title": "Pair layer input",
              "role": "edge state",
              "inside": "The layer begins from the current N by N pair representation and pair mask."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outgoing_update_produces_pair_state"
            },
            "label": "residual + row dropout",
            "connection": {
              "title": "Outgoing triangle update",
              "role": "two-edge path aggregation",
              "inside": "Information from outgoing triangular paths is added residually after row-wise dropout."
            }
          },
          {
            "match": {
              "relation_ref": "relations.incoming_update_produces_pair_state"
            },
            "label": "residual + row dropout",
            "connection": {
              "title": "Incoming triangle update",
              "role": "complementary path aggregation",
              "inside": "Incoming triangular paths provide the second multiplicative pair update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_produces_refined_pair_features"
            },
            "label": "residual MLP",
            "connection": {
              "title": "Pair transition output",
              "role": "channel mixing",
              "inside": "A pair-wise transition MLP is added residually and the pair mask is reapplied before the next of five layers."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_6956c306a672",
            "from": "initial_pair_features",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_features_enter_outgoing_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "p",
              "connection": {
                "title": "Pair layer input",
                "role": "edge state",
                "inside": "The layer begins from the current N by N pair representation and pair mask."
              }
            }
          },
          {
            "id": "projection_6ad7dd1ed2cf",
            "from": "pair_after_incoming",
            "to": "pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_state_enters_pair_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_enters_pair_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_00990df669d2",
            "from": "pair_after_outgoing",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_state_enters_incoming_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_enters_incoming_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a703fd7c3c92",
            "from": "pair_transition",
            "to": "refined_pair_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_produces_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_produces_refined_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual MLP",
              "connection": {
                "title": "Pair transition output",
                "role": "channel mixing",
                "inside": "A pair-wise transition MLP is added residually and the pair mask is reapplied before the next of five layers."
              }
            }
          },
          {
            "id": "projection_98d94cc85bea",
            "from": "triangle_multiplication_incoming",
            "to": "pair_after_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.incoming_update_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_update_produces_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual + row dropout",
              "connection": {
                "title": "Incoming triangle update",
                "role": "complementary path aggregation",
                "inside": "Incoming triangular paths provide the second multiplicative pair update."
              }
            }
          },
          {
            "id": "projection_5171cd52f0a4",
            "from": "triangle_multiplication_outgoing",
            "to": "pair_after_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outgoing_update_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_update_produces_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual + row dropout",
              "connection": {
                "title": "Outgoing triangle update",
                "role": "two-edge path aggregation",
                "inside": "Information from outgoing triangular paths is added residually after row-wise dropout."
              }
            }
          }
        ],
        "classifications": {
          "modules.pair_transition": "visible",
          "modules.triangle_multiplication_incoming": "visible",
          "modules.triangle_multiplication_outgoing": "visible",
          "value_sites.initial_pair_features": "visible",
          "value_sites.pair_after_incoming": "visible",
          "value_sites.pair_after_outgoing": "visible",
          "value_sites.refined_pair_features": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "structure_decoder",
        "title": "One Equivariant Structure Layer (Repeated ×8)",
        "summary": "IPA combines single, pair, and current-frame information; a residue-wise transition updates the latent state; a learned six-parameter rigid increment is composed into every residue frame.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.equivariant_structure_decoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "single_features",
            "ref": "value_sites.single_features",
            "label": "single features",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "refined pair features",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue mask",
            "notation": "m",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 2,
            "row": 1
          },
          {
            "id": "invariant_point_attention",
            "ref": "modules.invariant_point_attention",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "genie2_ipa_internals"
          },
          {
            "id": "single_after_ipa",
            "ref": "value_sites.single_after_ipa",
            "label": "attention-updated single state",
            "notation": "s_ipa",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "structure_transition",
            "ref": "modules.structure_transition",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "transitioned single state",
            "notation": "s'",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "backbone_update",
            "ref": "modules.backbone_update",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 5
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.updated_frames",
            "label": "updated residue frames",
            "notation": "T ∘ Delta T",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 5
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet frames enter this child board as an already-derived denoiser input from the sampling board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.single_features_enter_ipa"
            },
            "label": "residue state",
            "connection": {
              "title": "Single state into IPA",
              "role": "attention queries and values",
              "inside": "The per-residue latent state is updated while retaining one position per backbone residue."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_pair_features_bias_ipa"
            },
            "label": "pair context",
            "tone": "conditioning",
            "connection": {
              "title": "Pair-conditioned IPA",
              "role": "residue-pair context",
              "inside": "The refined pair tensor biases communication between residue positions and is not changed by the structure stack."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_condition_ipa"
            },
            "label": "frame points",
            "tone": "conditioning",
            "connection": {
              "title": "Equivariant geometric context",
              "role": "spatial attention",
              "inside": "Query, key, and value points are transformed through current residue frames so attention responds equivariantly to global rigid motions."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ipa_produces_updated_single_state"
            },
            "label": "residual + norm",
            "connection": {
              "title": "IPA-updated state",
              "role": "geometric attention output",
              "inside": "IPA is added to the incoming single state, followed by dropout and layer normalization."
            }
          },
          {
            "match": {
              "relation_ref": "relations.structure_transition_produces_single_state"
            },
            "label": "residue-wise MLP",
            "connection": {
              "title": "Structure transition",
              "role": "latent channel update",
              "inside": "A transition network mixes channels independently at each residue before frame regression."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_state_enters_backbone_update"
            },
            "label": "regress 6 parameters",
            "connection": {
              "title": "Rigid increment regression",
              "role": "frame-update parameters",
              "inside": "Each residue state is linearly projected to rotation and translation update parameters."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_backbone_update"
            },
            "label": "compose with T",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 42,
            "connection": {
              "title": "Frame composition",
              "role": "equivariant state update",
              "inside": "The learned local rigid increment is composed into the current frame rather than replacing it in a global coordinate system."
            }
          },
          {
            "match": {
              "relation_ref": "relations.backbone_update_produces_updated_frames"
            },
            "label": "next layer / denoiser output",
            "connection": {
              "title": "Updated frames",
              "role": "repeated structure state",
              "inside": "The updated frames feed the next structure layer; after eight layers they return to the denoiser noise readout."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_2b483a9c8db4",
            "from": "backbone_update",
            "to": "updated_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.backbone_update_produces_updated_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.backbone_update_produces_updated_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "next layer / denoiser output",
              "connection": {
                "title": "Updated frames",
                "role": "repeated structure state",
                "inside": "The updated frames feed the next structure layer; after eight layers they return to the denoiser noise readout."
              }
            }
          },
          {
            "id": "projection_5659bcb68cf2",
            "from": "current_frames",
            "to": "backbone_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_enter_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "compose with T",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 42,
              "connection": {
                "title": "Frame composition",
                "role": "equivariant state update",
                "inside": "The learned local rigid increment is composed into the current frame rather than replacing it in a global coordinate system."
              }
            }
          },
          {
            "id": "projection_7f4cc55c0622",
            "from": "current_frames",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_condition_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "frame points",
              "tone": "conditioning",
              "connection": {
                "title": "Equivariant geometric context",
                "role": "spatial attention",
                "inside": "Query, key, and value points are transformed through current residue frames so attention responds equivariantly to global rigid motions."
              }
            }
          },
          {
            "id": "projection_adee27c9f987",
            "from": "feature_bundle",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_masks_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_masks_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a5d4bbb29495",
            "from": "invariant_point_attention",
            "to": "single_after_ipa",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ipa_produces_updated_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ipa_produces_updated_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residual + norm",
              "connection": {
                "title": "IPA-updated state",
                "role": "geometric attention output",
                "inside": "IPA is added to the incoming single state, followed by dropout and layer normalization."
              }
            }
          },
          {
            "id": "projection_ba12da4da645",
            "from": "refined_pair_features",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_pair_features_bias_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "pair context",
              "tone": "conditioning",
              "connection": {
                "title": "Pair-conditioned IPA",
                "role": "residue-pair context",
                "inside": "The refined pair tensor biases communication between residue positions and is not changed by the structure stack."
              }
            }
          },
          {
            "id": "projection_f5fcbebc460e",
            "from": "single_after_ipa",
            "to": "structure_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.ipa_state_enters_structure_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ipa_state_enters_structure_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_4b3c7ed524f2",
            "from": "single_after_transition",
            "to": "backbone_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_state_enters_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_state_enters_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "regress 6 parameters",
              "connection": {
                "title": "Rigid increment regression",
                "role": "frame-update parameters",
                "inside": "Each residue state is linearly projected to rotation and translation update parameters."
              }
            }
          },
          {
            "id": "projection_9ebca3846d78",
            "from": "single_features",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_enter_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residue state",
              "connection": {
                "title": "Single state into IPA",
                "role": "attention queries and values",
                "inside": "The per-residue latent state is updated while retaining one position per backbone residue."
              }
            }
          },
          {
            "id": "projection_63b2834adefb",
            "from": "structure_transition",
            "to": "single_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.structure_transition_produces_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.structure_transition_produces_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residue-wise MLP",
              "connection": {
                "title": "Structure transition",
                "role": "latent channel update",
                "inside": "A transition network mixes channels independently at each residue before frame regression."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "visible",
          "modules.structure_transition": "visible",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.refined_pair_features": "visible",
          "value_sites.single_after_ipa": "visible",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_features": "visible",
          "value_sites.updated_frames": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "genie2_ipa_internals",
        "kind": "standard_block_instance",
        "title": "Genie 2 Invariant Point Attention Internals",
        "summary": "Full IPA combines scalar, pair, and frame-aware point terms, then the structure-layer wrapper applies residual dropout and LayerNorm.",
        "parent": "structure_decoder",
        "subject_ref": "modules.invariant_point_attention",
        "expansion_depth": 0,
        "block_instance_ref": "block_instances.structure_ipa",
        "grid": {
          "columns": 12,
          "rows": 10,
          "column_sizing": "content",
          "col_gap": 20,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "single_state",
            "label": "single state",
            "col": 1,
            "row": 1,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.ports.single_state",
            "instance_fact_ref": "block_instances.structure_ipa.ports.single_state",
            "kind": "representation",
            "rep_ref": "single_features",
            "shape": "B x N x 384",
            "scale": "residue",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s",
            "port_ref": "ports.single_state"
          },
          {
            "id": "pair_context",
            "label": "pair context",
            "col": 1,
            "row": 3,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.ports.pair_context",
            "instance_fact_ref": "block_instances.structure_ipa.ports.pair_context",
            "kind": "representation",
            "rep_ref": "pair_features",
            "shape": "B x N x N x 128",
            "scale": "pair",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "z",
            "port_ref": "ports.pair_context"
          },
          {
            "id": "frames",
            "label": "current frames",
            "col": 1,
            "row": 4,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.ports.frames",
            "instance_fact_ref": "block_instances.structure_ipa.ports.frames",
            "kind": "representation",
            "rep_ref": "residue_frames",
            "shape": "B x N x (3 x 3 + 3)",
            "scale": "residue",
            "glyph": "frames",
            "flow_family": "frame",
            "notation": "T",
            "port_ref": "ports.frames"
          },
          {
            "id": "mask",
            "label": "valid-item mask",
            "col": 4,
            "row": 4,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.ports.mask",
            "instance_fact_ref": "block_instances.structure_ipa.ports.mask",
            "kind": "representation",
            "rep_ref": "feature_bundle",
            "shape": "B x N fields + B x N x N masks",
            "scale": "mixed",
            "glyph": "vector",
            "notation": "m",
            "port_ref": "ports.mask"
          },
          {
            "id": "updated_single_state",
            "label": "IPA-updated single state",
            "col": 12,
            "row": 10,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.ports.updated_single_state",
            "instance_fact_ref": "block_instances.structure_ipa.ports.updated_single_state",
            "kind": "representation",
            "rep_ref": "single_features",
            "shape": "B x N x 384",
            "scale": "residue",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s_ipa",
            "port_ref": "ports.updated_single_state"
          },
          {
            "id": "project_scalar_terms",
            "label": "Project scalar Q/K/V",
            "col": 2,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_scalar_terms",
            "kind": "operation",
            "scale": "operation",
            "detail": "scalar_qkv_projection",
            "code": "q_s, k_s, v_s = project_scalar_qkv(single_state)",
            "operation": "scalar_qkv_projection"
          },
          {
            "id": "scalar_terms",
            "label": "scalar Q/K/V",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.scalar_terms",
            "instance_fact_ref": "block_instances.structure_ipa.values.scalar_terms",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "qkv_s"
          },
          {
            "id": "scalar_attention_logits",
            "label": "Form scalar logits",
            "col": 4,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.scalar_attention_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "attention_logits",
            "code": "scalar_logits = dot(q_s, k_s) * scalar_scale",
            "operation": "attention_logits"
          },
          {
            "id": "scalar_logits",
            "label": "scalar logits",
            "col": 5,
            "row": 1,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.scalar_logits",
            "instance_fact_ref": "block_instances.structure_ipa.values.scalar_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l_s"
          },
          {
            "id": "project_local_points",
            "label": "Project local Q/K/V points",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_local_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_local_points",
            "kind": "operation",
            "scale": "operation",
            "detail": "point_qkv_projection",
            "code": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)",
            "operation": "point_qkv_projection"
          },
          {
            "id": "local_points",
            "label": "local Q/K/V points",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.local_points",
            "instance_fact_ref": "block_instances.structure_ipa.values.local_points",
            "kind": "representation",
            "scale": "item",
            "glyph": "coordinates",
            "flow_family": "coordinate",
            "notation": "qkv_p"
          },
          {
            "id": "transform_points_to_global",
            "label": "Express points in global frame",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instance_fact_ref": "block_instances.structure_ipa.steps.transform_points_to_global",
            "kind": "operation",
            "scale": "operation",
            "detail": "rigid_apply",
            "code": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)",
            "operation": "rigid_apply"
          },
          {
            "id": "global_points",
            "label": "global Q/K/V points",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.global_points",
            "instance_fact_ref": "block_instances.structure_ipa.values.global_points",
            "kind": "representation",
            "scale": "item",
            "glyph": "coordinates",
            "flow_family": "coordinate",
            "notation": "T_qkv_p"
          },
          {
            "id": "point_distance_logits",
            "label": "Form point-distance logits",
            "col": 6,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.point_distance_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "invariant_point_distance",
            "code": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)",
            "operation": "invariant_point_distance"
          },
          {
            "id": "point_logits",
            "label": "point-distance logits",
            "col": 7,
            "row": 2,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.point_logits",
            "instance_fact_ref": "block_instances.structure_ipa.values.point_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l_p"
          },
          {
            "id": "project_pair_bias",
            "label": "Project pair bias",
            "col": 2,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_pair_bias",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_bias_projection",
            "code": "pair_bias = linear_b(pair_context)",
            "operation": "pair_bias_projection"
          },
          {
            "id": "pair_bias",
            "label": "pair bias",
            "col": 5,
            "row": 3,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.pair_bias",
            "instance_fact_ref": "block_instances.structure_ipa.values.pair_bias",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "b_z"
          },
          {
            "id": "combine_and_mask_logits",
            "label": "Combine logits and apply mask",
            "col": 6,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "ipa_logit_composition",
            "code": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)",
            "operation": "ipa_logit_composition"
          },
          {
            "id": "combined_logits",
            "label": "combined masked logits",
            "col": 7,
            "row": 4,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.combined_logits",
            "instance_fact_ref": "block_instances.structure_ipa.values.combined_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l"
          },
          {
            "id": "softmax_attention",
            "label": "Normalize over keys",
            "col": 6,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.softmax_attention",
            "instance_fact_ref": "block_instances.structure_ipa.steps.softmax_attention",
            "kind": "operation",
            "scale": "operation",
            "detail": "softmax",
            "code": "attention = softmax(combined_logits, dim=keys)",
            "operation": "softmax"
          },
          {
            "id": "attention_weights",
            "label": "attention weights",
            "col": 7,
            "row": 5,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.attention_weights",
            "instance_fact_ref": "block_instances.structure_ipa.values.attention_weights",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "a"
          },
          {
            "id": "aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "col": 7,
            "row": 7,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "kind": "operation",
            "scale": "operation",
            "detail": "weighted_sum",
            "code": "scalar_context = weighted_sum(attention, v_s)",
            "operation": "weighted_sum"
          },
          {
            "id": "scalar_context",
            "label": "scalar context",
            "col": 8,
            "row": 7,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.scalar_context",
            "instance_fact_ref": "block_instances.structure_ipa.values.scalar_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "o_s"
          },
          {
            "id": "aggregate_pair_values",
            "label": "Aggregate pair values",
            "col": 7,
            "row": 8,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_value_aggregation",
            "code": "pair_value_context = weighted_sum(attention, pair_context)",
            "operation": "pair_value_aggregation"
          },
          {
            "id": "pair_value_context",
            "label": "pair-value context",
            "col": 8,
            "row": 8,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.pair_value_context",
            "instance_fact_ref": "block_instances.structure_ipa.values.pair_value_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "o_z"
          },
          {
            "id": "aggregate_global_points",
            "label": "Aggregate value points",
            "col": 7,
            "row": 9,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_global_points",
            "kind": "operation",
            "scale": "operation",
            "detail": "weighted_point_sum",
            "code": "global_point_context = weighted_sum(attention, v_p_global)",
            "operation": "weighted_point_sum"
          },
          {
            "id": "global_point_context",
            "label": "global point context",
            "col": 8,
            "row": 9,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.global_point_context",
            "instance_fact_ref": "block_instances.structure_ipa.values.global_point_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "coordinates",
            "flow_family": "coordinate",
            "notation": "o_p_global"
          },
          {
            "id": "return_points_to_local_frame",
            "label": "Return points to query frame",
            "col": 9,
            "row": 9,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instance_fact_ref": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "kind": "operation",
            "scale": "operation",
            "detail": "rigid_inverse_apply",
            "code": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))",
            "operation": "rigid_inverse_apply"
          },
          {
            "id": "local_point_context",
            "label": "local points + norms",
            "col": 10,
            "row": 9,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.local_point_context",
            "instance_fact_ref": "block_instances.structure_ipa.values.local_point_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "coordinates",
            "flow_family": "coordinate",
            "notation": "o_p_local"
          },
          {
            "id": "project_ipa_delta",
            "label": "Fuse IPA outputs",
            "col": 9,
            "row": 10,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_ipa_delta",
            "kind": "operation",
            "scale": "operation",
            "detail": "output_projection",
            "code": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))",
            "operation": "output_projection"
          },
          {
            "id": "ipa_delta",
            "label": "IPA delta",
            "col": 10,
            "row": 10,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.values.ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.values.ipa_delta",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "delta_s"
          },
          {
            "id": "residual_norm",
            "label": "Residual, dropout, and norm",
            "col": 11,
            "row": 10,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.structure_ipa.steps.residual_norm",
            "kind": "operation",
            "scale": "operation",
            "detail": "residual_normalization",
            "code": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))",
            "operation": "residual_normalization"
          }
        ],
        "edges": [
          {
            "id": "structure_ipa__project_scalar_terms__input_1",
            "from": "single_state",
            "to": "project_scalar_terms",
            "kind": "data_flow",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_scalar_terms",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Project scalar Q/K/V",
              "role": "reusable step input",
              "inside": "q_s, k_s, v_s = project_scalar_qkv(single_state)"
            }
          },
          {
            "id": "structure_ipa__project_scalar_terms__output_1",
            "from": "project_scalar_terms",
            "to": "scalar_terms",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_scalar_terms",
            "template_data_ref": "values.scalar_terms",
            "connection": {
              "title": "Project scalar Q/K/V",
              "role": "reusable step output",
              "inside": "q_s, k_s, v_s = project_scalar_qkv(single_state)"
            }
          },
          {
            "id": "structure_ipa__project_local_points__input_1",
            "from": "single_state",
            "to": "project_local_points",
            "kind": "data_flow",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_local_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_local_points",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Project local Q/K/V points",
              "role": "reusable step input",
              "inside": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)"
            }
          },
          {
            "id": "structure_ipa__project_local_points__output_1",
            "from": "project_local_points",
            "to": "local_points",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_local_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_local_points",
            "template_data_ref": "values.local_points",
            "connection": {
              "title": "Project local Q/K/V points",
              "role": "reusable step output",
              "inside": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)"
            }
          },
          {
            "id": "structure_ipa__transform_points_to_global__input_1",
            "from": "local_points",
            "to": "transform_points_to_global",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instance_fact_ref": "block_instances.structure_ipa.steps.transform_points_to_global",
            "template_data_ref": "values.local_points",
            "connection": {
              "title": "Express points in global frame",
              "role": "reusable step input",
              "inside": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)"
            }
          },
          {
            "id": "structure_ipa__transform_points_to_global__input_2",
            "from": "frames",
            "to": "transform_points_to_global",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.residue_frames"
            ],
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instance_fact_ref": "block_instances.structure_ipa.steps.transform_points_to_global",
            "template_data_ref": "ports.frames",
            "connection": {
              "title": "Express points in global frame",
              "role": "reusable step input",
              "inside": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)"
            }
          },
          {
            "id": "structure_ipa__transform_points_to_global__output_1",
            "from": "transform_points_to_global",
            "to": "global_points",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instance_fact_ref": "block_instances.structure_ipa.steps.transform_points_to_global",
            "template_data_ref": "values.global_points",
            "connection": {
              "title": "Express points in global frame",
              "role": "reusable step output",
              "inside": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)"
            }
          },
          {
            "id": "structure_ipa__scalar_attention_logits__input_1",
            "from": "scalar_terms",
            "to": "scalar_attention_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.scalar_attention_logits",
            "template_data_ref": "values.scalar_terms",
            "connection": {
              "title": "Form scalar logits",
              "role": "reusable step input",
              "inside": "scalar_logits = dot(q_s, k_s) * scalar_scale"
            }
          },
          {
            "id": "structure_ipa__scalar_attention_logits__output_1",
            "from": "scalar_attention_logits",
            "to": "scalar_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.scalar_attention_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Form scalar logits",
              "role": "reusable step output",
              "inside": "scalar_logits = dot(q_s, k_s) * scalar_scale"
            }
          },
          {
            "id": "structure_ipa__point_distance_logits__input_1",
            "from": "global_points",
            "to": "point_distance_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.point_distance_logits",
            "template_data_ref": "values.global_points",
            "connection": {
              "title": "Form point-distance logits",
              "role": "reusable step input",
              "inside": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)"
            }
          },
          {
            "id": "structure_ipa__point_distance_logits__output_1",
            "from": "point_distance_logits",
            "to": "point_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.point_distance_logits",
            "template_data_ref": "values.point_logits",
            "connection": {
              "title": "Form point-distance logits",
              "role": "reusable step output",
              "inside": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)"
            }
          },
          {
            "id": "structure_ipa__project_pair_bias__input_1",
            "from": "pair_context",
            "to": "project_pair_bias",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.pair_features"
            ],
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_pair_bias",
            "template_data_ref": "ports.pair_context",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step input",
              "inside": "pair_bias = linear_b(pair_context)"
            }
          },
          {
            "id": "structure_ipa__project_pair_bias__output_1",
            "from": "project_pair_bias",
            "to": "pair_bias",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_pair_bias",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step output",
              "inside": "pair_bias = linear_b(pair_context)"
            }
          },
          {
            "id": "structure_ipa__combine_and_mask_logits__input_1",
            "from": "scalar_logits",
            "to": "combine_and_mask_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Combine logits and apply mask",
              "role": "reusable step input",
              "inside": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)"
            }
          },
          {
            "id": "structure_ipa__combine_and_mask_logits__input_2",
            "from": "point_logits",
            "to": "combine_and_mask_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "template_data_ref": "values.point_logits",
            "connection": {
              "title": "Combine logits and apply mask",
              "role": "reusable step input",
              "inside": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)"
            }
          },
          {
            "id": "structure_ipa__combine_and_mask_logits__input_3",
            "from": "pair_bias",
            "to": "combine_and_mask_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Combine logits and apply mask",
              "role": "reusable step input",
              "inside": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)"
            }
          },
          {
            "id": "structure_ipa__combine_and_mask_logits__input_4",
            "from": "mask",
            "to": "combine_and_mask_logits",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.feature_bundle"
            ],
            "relation_path": [
              "relations.feature_bundle_masks_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "template_data_ref": "ports.mask",
            "connection": {
              "title": "Combine logits and apply mask",
              "role": "reusable step input",
              "inside": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)"
            }
          },
          {
            "id": "structure_ipa__combine_and_mask_logits__output_1",
            "from": "combine_and_mask_logits",
            "to": "combined_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instance_fact_ref": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "template_data_ref": "values.combined_logits",
            "connection": {
              "title": "Combine logits and apply mask",
              "role": "reusable step output",
              "inside": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)"
            }
          },
          {
            "id": "structure_ipa__softmax_attention__input_1",
            "from": "combined_logits",
            "to": "softmax_attention",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.softmax_attention",
            "instance_fact_ref": "block_instances.structure_ipa.steps.softmax_attention",
            "template_data_ref": "values.combined_logits",
            "connection": {
              "title": "Normalize over keys",
              "role": "reusable step input",
              "inside": "attention = softmax(combined_logits, dim=keys)"
            }
          },
          {
            "id": "structure_ipa__softmax_attention__output_1",
            "from": "softmax_attention",
            "to": "attention_weights",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.softmax_attention",
            "instance_fact_ref": "block_instances.structure_ipa.steps.softmax_attention",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Normalize over keys",
              "role": "reusable step output",
              "inside": "attention = softmax(combined_logits, dim=keys)"
            }
          },
          {
            "id": "structure_ipa__aggregate_scalar_values__input_1",
            "from": "attention_weights",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = weighted_sum(attention, v_s)"
            }
          },
          {
            "id": "structure_ipa__aggregate_scalar_values__input_2",
            "from": "scalar_terms",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_terms",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = weighted_sum(attention, v_s)"
            }
          },
          {
            "id": "structure_ipa__aggregate_scalar_values__output_1",
            "from": "aggregate_scalar_values",
            "to": "scalar_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step output",
              "inside": "scalar_context = weighted_sum(attention, v_s)"
            }
          },
          {
            "id": "structure_ipa__aggregate_global_points__input_1",
            "from": "attention_weights",
            "to": "aggregate_global_points",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_global_points",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate value points",
              "role": "reusable step input",
              "inside": "global_point_context = weighted_sum(attention, v_p_global)"
            }
          },
          {
            "id": "structure_ipa__aggregate_global_points__input_2",
            "from": "global_points",
            "to": "aggregate_global_points",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_global_points",
            "template_data_ref": "values.global_points",
            "connection": {
              "title": "Aggregate value points",
              "role": "reusable step input",
              "inside": "global_point_context = weighted_sum(attention, v_p_global)"
            }
          },
          {
            "id": "structure_ipa__aggregate_global_points__output_1",
            "from": "aggregate_global_points",
            "to": "global_point_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_global_points",
            "template_data_ref": "values.global_point_context",
            "connection": {
              "title": "Aggregate value points",
              "role": "reusable step output",
              "inside": "global_point_context = weighted_sum(attention, v_p_global)"
            }
          },
          {
            "id": "structure_ipa__return_points_to_local_frame__input_1",
            "from": "global_point_context",
            "to": "return_points_to_local_frame",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instance_fact_ref": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "template_data_ref": "values.global_point_context",
            "connection": {
              "title": "Return points to query frame",
              "role": "reusable step input",
              "inside": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))"
            }
          },
          {
            "id": "structure_ipa__return_points_to_local_frame__input_2",
            "from": "frames",
            "to": "return_points_to_local_frame",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.residue_frames"
            ],
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instance_fact_ref": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "template_data_ref": "ports.frames",
            "connection": {
              "title": "Return points to query frame",
              "role": "reusable step input",
              "inside": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))"
            }
          },
          {
            "id": "structure_ipa__return_points_to_local_frame__output_1",
            "from": "return_points_to_local_frame",
            "to": "local_point_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instance_fact_ref": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "template_data_ref": "values.local_point_context",
            "connection": {
              "title": "Return points to query frame",
              "role": "reusable step output",
              "inside": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))"
            }
          },
          {
            "id": "structure_ipa__aggregate_pair_values__input_1",
            "from": "attention_weights",
            "to": "aggregate_pair_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step input",
              "inside": "pair_value_context = weighted_sum(attention, pair_context)"
            }
          },
          {
            "id": "structure_ipa__aggregate_pair_values__input_2",
            "from": "pair_context",
            "to": "aggregate_pair_values",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.pair_features"
            ],
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "template_data_ref": "ports.pair_context",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step input",
              "inside": "pair_value_context = weighted_sum(attention, pair_context)"
            }
          },
          {
            "id": "structure_ipa__aggregate_pair_values__output_1",
            "from": "aggregate_pair_values",
            "to": "pair_value_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "template_data_ref": "values.pair_value_context",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step output",
              "inside": "pair_value_context = weighted_sum(attention, pair_context)"
            }
          },
          {
            "id": "structure_ipa__project_ipa_delta__input_1",
            "from": "scalar_context",
            "to": "project_ipa_delta",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_ipa_delta",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Fuse IPA outputs",
              "role": "reusable step input",
              "inside": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))"
            }
          },
          {
            "id": "structure_ipa__project_ipa_delta__input_2",
            "from": "local_point_context",
            "to": "project_ipa_delta",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_ipa_delta",
            "template_data_ref": "values.local_point_context",
            "connection": {
              "title": "Fuse IPA outputs",
              "role": "reusable step input",
              "inside": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))"
            }
          },
          {
            "id": "structure_ipa__project_ipa_delta__input_3",
            "from": "pair_value_context",
            "to": "project_ipa_delta",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_ipa_delta",
            "template_data_ref": "values.pair_value_context",
            "connection": {
              "title": "Fuse IPA outputs",
              "role": "reusable step input",
              "inside": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))"
            }
          },
          {
            "id": "structure_ipa__project_ipa_delta__output_1",
            "from": "project_ipa_delta",
            "to": "ipa_delta",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instance_fact_ref": "block_instances.structure_ipa.steps.project_ipa_delta",
            "template_data_ref": "values.ipa_delta",
            "connection": {
              "title": "Fuse IPA outputs",
              "role": "reusable step output",
              "inside": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))"
            }
          },
          {
            "id": "structure_ipa__residual_norm__input_1",
            "from": "single_state",
            "to": "residual_norm",
            "kind": "data_flow",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.structure_ipa.steps.residual_norm",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step input",
              "inside": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))"
            }
          },
          {
            "id": "structure_ipa__residual_norm__input_2",
            "from": "ipa_delta",
            "to": "residual_norm",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.structure_ipa.steps.residual_norm",
            "template_data_ref": "values.ipa_delta",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step input",
              "inside": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))"
            }
          },
          {
            "id": "structure_ipa__residual_norm__output_1",
            "from": "residual_norm",
            "to": "updated_single_state",
            "kind": "state_update",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.ipa_produces_updated_single_state"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/invariant-point-attention.yaml",
            "standard_block_id": "invariant_point_attention",
            "block_instance_ref": "block_instances.structure_ipa",
            "template_fact_ref": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.structure_ipa.steps.residual_norm",
            "template_data_ref": "ports.updated_single_state",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step output",
              "inside": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))"
            }
          }
        ],
        "segments": [
          {
            "id": "attention_weights",
            "label": "Compute attention weights",
            "description": "Form scalar and invariant point-distance logits, add pair bias, apply the validity mask, and normalize once over keys. Bundled Q/K/V projections also prepare the value terms consumed in Phase 2.",
            "order": 1,
            "node_ids": [
              "single_state",
              "pair_context",
              "frames",
              "mask",
              "project_scalar_terms",
              "scalar_terms",
              "scalar_attention_logits",
              "scalar_logits",
              "project_local_points",
              "local_points",
              "transform_points_to_global",
              "global_points",
              "point_distance_logits",
              "point_logits",
              "project_pair_bias",
              "pair_bias",
              "combine_and_mask_logits",
              "combined_logits",
              "softmax_attention",
              "attention_weights"
            ]
          },
          {
            "id": "value_extraction",
            "label": "Extract values and update state",
            "description": "Reuse the shared attention weights for scalar, point, and pair values, return points to the local frame, fuse the contexts, and apply the residual wrapper.",
            "order": 2,
            "node_ids": [
              "aggregate_scalar_values",
              "scalar_context",
              "aggregate_global_points",
              "global_point_context",
              "return_points_to_local_frame",
              "local_point_context",
              "aggregate_pair_values",
              "pair_value_context",
              "project_ipa_delta",
              "ipa_delta",
              "residual_norm",
              "updated_single_state"
            ]
          }
        ],
        "projectionMode": "standard_block_template",
        "standardBlockRef": "standard_blocks/invariant-point-attention.yaml",
        "standardBlockId": "invariant_point_attention",
        "blockInstanceRef": "block_instances.structure_ipa",
        "variant": "full_ipa_residual_norm",
        "variantLabel": "Full IPA + residual normalization",
        "useScope": "whole_module",
        "conformance": "exact",
        "pseudocode": [
          {
            "id": "project_scalar_terms",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_scalar_terms",
            "label": "Project scalar Q/K/V",
            "operation": "scalar_qkv_projection",
            "code": "q_s, k_s, v_s = project_scalar_qkv(single_state)",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.scalar_terms"
            ],
            "codeBindings": [
              {
                "lexeme": "q_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 3
                  }
                ]
              },
              {
                "lexeme": "k_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 5,
                    "end": 8
                  }
                ]
              },
              {
                "lexeme": "v_s",
                "access": "write",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 10,
                    "end": 13
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 35,
                    "end": 47
                  }
                ]
              }
            ]
          },
          {
            "id": "project_local_points",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_local_points",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_local_points",
            "label": "Project local Q/K/V points",
            "operation": "point_qkv_projection",
            "code": "q_p_local, k_p_local, v_p_local = project_point_qkv(single_state)",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.local_points"
            ],
            "codeBindings": [
              {
                "lexeme": "q_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "k_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 11,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "v_p_local",
                "access": "write",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 22,
                    "end": 31
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 52,
                    "end": 64
                  }
                ]
              }
            ]
          },
          {
            "id": "transform_points_to_global",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
            "instanceFactRef": "block_instances.structure_ipa.steps.transform_points_to_global",
            "label": "Express points in global frame",
            "operation": "rigid_apply",
            "code": "q_p_global, k_p_global, v_p_global = frames.apply(q_p_local, k_p_local, v_p_local)",
            "inputs": [
              "values.local_points",
              "ports.frames"
            ],
            "outputs": [
              "values.global_points"
            ],
            "codeBindings": [
              {
                "lexeme": "q_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 10
                  }
                ]
              },
              {
                "lexeme": "k_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 12,
                    "end": 22
                  }
                ]
              },
              {
                "lexeme": "v_p_global",
                "access": "write",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 24,
                    "end": 34
                  }
                ]
              },
              {
                "lexeme": "frames",
                "access": "read",
                "localRef": "ports.frames",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.frames",
                "instanceFactRef": "block_instances.structure_ipa.ports.frames",
                "occurrences": [
                  {
                    "start": 37,
                    "end": 43
                  }
                ]
              },
              {
                "lexeme": "q_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 50,
                    "end": 59
                  }
                ]
              },
              {
                "lexeme": "k_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 61,
                    "end": 70
                  }
                ]
              },
              {
                "lexeme": "v_p_local",
                "access": "read",
                "localRef": "values.local_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_points",
                "instanceFactRef": "block_instances.structure_ipa.values.local_points",
                "occurrences": [
                  {
                    "start": 72,
                    "end": 81
                  }
                ]
              }
            ]
          },
          {
            "id": "scalar_attention_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.scalar_attention_logits",
            "label": "Form scalar logits",
            "operation": "attention_logits",
            "code": "scalar_logits = dot(q_s, k_s) * scalar_scale",
            "inputs": [
              "values.scalar_terms"
            ],
            "outputs": [
              "values.scalar_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "scalar_logits",
                "access": "write",
                "localRef": "values.scalar_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 13
                  }
                ]
              },
              {
                "lexeme": "q_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 20,
                    "end": 23
                  }
                ]
              },
              {
                "lexeme": "k_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 25,
                    "end": 28
                  }
                ]
              }
            ]
          },
          {
            "id": "point_distance_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.point_distance_logits",
            "label": "Form point-distance logits",
            "operation": "invariant_point_distance",
            "code": "point_logits = -0.5 * point_weight * squared_distance(q_p_global, k_p_global)",
            "inputs": [
              "values.global_points"
            ],
            "outputs": [
              "values.point_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "point_logits",
                "access": "write",
                "localRef": "values.point_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.point_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.point_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 12
                  }
                ]
              },
              {
                "lexeme": "q_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 54,
                    "end": 64
                  }
                ]
              },
              {
                "lexeme": "k_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 66,
                    "end": 76
                  }
                ]
              }
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = linear_b(pair_context)",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ],
            "codeBindings": [
              {
                "lexeme": "pair_bias",
                "access": "write",
                "localRef": "values.pair_bias",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_bias",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_bias",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "pair_context",
                "access": "read",
                "localRef": "ports.pair_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.pair_context",
                "instanceFactRef": "block_instances.structure_ipa.ports.pair_context",
                "occurrences": [
                  {
                    "start": 21,
                    "end": 33
                  }
                ]
              }
            ]
          },
          {
            "id": "combine_and_mask_logits",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
            "instanceFactRef": "block_instances.structure_ipa.steps.combine_and_mask_logits",
            "label": "Combine logits and apply mask",
            "operation": "ipa_logit_composition",
            "code": "combined_logits = apply_mask(scalar_logits + point_logits + pair_bias, mask)",
            "inputs": [
              "values.scalar_logits",
              "values.point_logits",
              "values.pair_bias",
              "ports.mask"
            ],
            "outputs": [
              "values.combined_logits"
            ],
            "codeBindings": [
              {
                "lexeme": "combined_logits",
                "access": "write",
                "localRef": "values.combined_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.combined_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.combined_logits",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 15
                  }
                ]
              },
              {
                "lexeme": "scalar_logits",
                "access": "read",
                "localRef": "values.scalar_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_logits",
                "occurrences": [
                  {
                    "start": 29,
                    "end": 42
                  }
                ]
              },
              {
                "lexeme": "point_logits",
                "access": "read",
                "localRef": "values.point_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.point_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.point_logits",
                "occurrences": [
                  {
                    "start": 45,
                    "end": 57
                  }
                ]
              },
              {
                "lexeme": "pair_bias",
                "access": "read",
                "localRef": "values.pair_bias",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_bias",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_bias",
                "occurrences": [
                  {
                    "start": 60,
                    "end": 69
                  }
                ]
              },
              {
                "lexeme": "mask",
                "access": "read",
                "localRef": "ports.mask",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.mask",
                "instanceFactRef": "block_instances.structure_ipa.ports.mask",
                "occurrences": [
                  {
                    "start": 71,
                    "end": 75
                  }
                ]
              }
            ]
          },
          {
            "id": "softmax_attention",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.softmax_attention",
            "instanceFactRef": "block_instances.structure_ipa.steps.softmax_attention",
            "label": "Normalize over keys",
            "operation": "softmax",
            "code": "attention = softmax(combined_logits, dim=keys)",
            "inputs": [
              "values.combined_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ],
            "codeBindings": [
              {
                "lexeme": "attention",
                "access": "write",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "combined_logits",
                "access": "read",
                "localRef": "values.combined_logits",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.combined_logits",
                "instanceFactRef": "block_instances.structure_ipa.values.combined_logits",
                "occurrences": [
                  {
                    "start": 20,
                    "end": 35
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = weighted_sum(attention, v_s)",
            "inputs": [
              "values.attention_weights",
              "values.scalar_terms"
            ],
            "outputs": [
              "values.scalar_context"
            ],
            "codeBindings": [
              {
                "lexeme": "scalar_context",
                "access": "write",
                "localRef": "values.scalar_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_context",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 14
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 30,
                    "end": 39
                  }
                ]
              },
              {
                "lexeme": "v_s",
                "access": "read",
                "localRef": "values.scalar_terms",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_terms",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_terms",
                "occurrences": [
                  {
                    "start": 41,
                    "end": 44
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_global_points",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_global_points",
            "label": "Aggregate value points",
            "operation": "weighted_point_sum",
            "code": "global_point_context = weighted_sum(attention, v_p_global)",
            "inputs": [
              "values.attention_weights",
              "values.global_points"
            ],
            "outputs": [
              "values.global_point_context"
            ],
            "codeBindings": [
              {
                "lexeme": "global_point_context",
                "access": "write",
                "localRef": "values.global_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.global_point_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 36,
                    "end": 45
                  }
                ]
              },
              {
                "lexeme": "v_p_global",
                "access": "read",
                "localRef": "values.global_points",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_points",
                "instanceFactRef": "block_instances.structure_ipa.values.global_points",
                "occurrences": [
                  {
                    "start": 47,
                    "end": 57
                  }
                ]
              }
            ]
          },
          {
            "id": "return_points_to_local_frame",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
            "instanceFactRef": "block_instances.structure_ipa.steps.return_points_to_local_frame",
            "label": "Return points to query frame",
            "operation": "rigid_inverse_apply",
            "code": "local_point_context = concat(frames.invert_apply(global_point_context), point_norms(global_point_context))",
            "inputs": [
              "values.global_point_context",
              "ports.frames"
            ],
            "outputs": [
              "values.local_point_context"
            ],
            "codeBindings": [
              {
                "lexeme": "local_point_context",
                "access": "write",
                "localRef": "values.local_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.local_point_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 19
                  }
                ]
              },
              {
                "lexeme": "frames",
                "access": "read",
                "localRef": "ports.frames",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.frames",
                "instanceFactRef": "block_instances.structure_ipa.ports.frames",
                "occurrences": [
                  {
                    "start": 29,
                    "end": 35
                  }
                ]
              },
              {
                "lexeme": "global_point_context",
                "access": "read",
                "localRef": "values.global_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.global_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.global_point_context",
                "occurrences": [
                  {
                    "start": 49,
                    "end": 69
                  },
                  {
                    "start": 84,
                    "end": 104
                  }
                ]
              }
            ]
          },
          {
            "id": "aggregate_pair_values",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
            "instanceFactRef": "block_instances.structure_ipa.steps.aggregate_pair_values",
            "label": "Aggregate pair values",
            "operation": "pair_value_aggregation",
            "code": "pair_value_context = weighted_sum(attention, pair_context)",
            "inputs": [
              "values.attention_weights",
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_value_context"
            ],
            "codeBindings": [
              {
                "lexeme": "pair_value_context",
                "access": "write",
                "localRef": "values.pair_value_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_value_context",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_value_context",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 18
                  }
                ]
              },
              {
                "lexeme": "attention",
                "access": "read",
                "localRef": "values.attention_weights",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.attention_weights",
                "instanceFactRef": "block_instances.structure_ipa.values.attention_weights",
                "occurrences": [
                  {
                    "start": 34,
                    "end": 43
                  }
                ]
              },
              {
                "lexeme": "pair_context",
                "access": "read",
                "localRef": "ports.pair_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.pair_context",
                "instanceFactRef": "block_instances.structure_ipa.ports.pair_context",
                "occurrences": [
                  {
                    "start": 45,
                    "end": 57
                  }
                ]
              }
            ]
          },
          {
            "id": "project_ipa_delta",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
            "instanceFactRef": "block_instances.structure_ipa.steps.project_ipa_delta",
            "label": "Fuse IPA outputs",
            "operation": "output_projection",
            "code": "ipa_delta = output_projection(concat(scalar_context, local_point_context, pair_value_context))",
            "inputs": [
              "values.scalar_context",
              "values.local_point_context",
              "values.pair_value_context"
            ],
            "outputs": [
              "values.ipa_delta"
            ],
            "codeBindings": [
              {
                "lexeme": "ipa_delta",
                "access": "write",
                "localRef": "values.ipa_delta",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.ipa_delta",
                "instanceFactRef": "block_instances.structure_ipa.values.ipa_delta",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 9
                  }
                ]
              },
              {
                "lexeme": "scalar_context",
                "access": "read",
                "localRef": "values.scalar_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.scalar_context",
                "instanceFactRef": "block_instances.structure_ipa.values.scalar_context",
                "occurrences": [
                  {
                    "start": 37,
                    "end": 51
                  }
                ]
              },
              {
                "lexeme": "local_point_context",
                "access": "read",
                "localRef": "values.local_point_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.local_point_context",
                "instanceFactRef": "block_instances.structure_ipa.values.local_point_context",
                "occurrences": [
                  {
                    "start": 53,
                    "end": 72
                  }
                ]
              },
              {
                "lexeme": "pair_value_context",
                "access": "read",
                "localRef": "values.pair_value_context",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.pair_value_context",
                "instanceFactRef": "block_instances.structure_ipa.values.pair_value_context",
                "occurrences": [
                  {
                    "start": 74,
                    "end": 92
                  }
                ]
              }
            ]
          },
          {
            "id": "residual_norm",
            "templateFactRef": "standard_blocks.invariant_point_attention.steps.residual_norm",
            "instanceFactRef": "block_instances.structure_ipa.steps.residual_norm",
            "label": "Residual, dropout, and norm",
            "operation": "residual_normalization",
            "code": "updated_single_state = layer_norm(single_state + dropout(ipa_delta))",
            "inputs": [
              "ports.single_state",
              "values.ipa_delta"
            ],
            "outputs": [
              "ports.updated_single_state"
            ],
            "codeBindings": [
              {
                "lexeme": "updated_single_state",
                "access": "write",
                "localRef": "ports.updated_single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.updated_single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.updated_single_state",
                "occurrences": [
                  {
                    "start": 0,
                    "end": 20
                  }
                ]
              },
              {
                "lexeme": "single_state",
                "access": "read",
                "localRef": "ports.single_state",
                "templateFactRef": "standard_blocks.invariant_point_attention.ports.single_state",
                "instanceFactRef": "block_instances.structure_ipa.ports.single_state",
                "occurrences": [
                  {
                    "start": 34,
                    "end": 46
                  }
                ]
              },
              {
                "lexeme": "ipa_delta",
                "access": "read",
                "localRef": "values.ipa_delta",
                "templateFactRef": "standard_blocks.invariant_point_attention.values.ipa_delta",
                "instanceFactRef": "block_instances.structure_ipa.values.ipa_delta",
                "occurrences": [
                  {
                    "start": 57,
                    "end": 66
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
