export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/genie3.yaml": "d5fa7111d849a7e83ec13468283da422c9e3de8973c995324ae1ff457b6a2bc3",
      "views/genie3-semantic-zoom.view.yaml": "e9574098fcaa8cde9cbe3b508dc0a6a4d0431919af338ad1fb4146f57f638fe9",
      "pseudocode/genie3.yaml": "f6980f6073739ce70e5ef72d6f4530987b0887cd67723788195569b161f5cc87",
      "standard_blocks/pair-biased-attention.yaml": "88379fcd3ad641e38da23ce3b5a9ccef84344149d9c8fac51792ad63cb9da7dc",
      "standard_blocks/invariant-point-attention.yaml": "a88d3bd473e6bbfeb6846085f7d5091e6e8b0e33fbbd8292af4d578df22b2c27"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "genie3",
    "name": "Genie 3 Atom-Aware Protein Diffusion",
    "family": "protein_structure_diffusion",
    "status": "draft",
    "taskModes": [
      "unconditional_generation",
      "single_motif_scaffolding",
      "multi_motif_scaffolding",
      "binder_design"
    ],
    "referenceConfiguration": {
      "checkpoint": "pretrained_v1_step_600000",
      "protein_representation": "atom14_capable_partial_atomization",
      "diffusion_steps": 1000,
      "default_sampling_steps": 100,
      "single_feature_dimension": 384,
      "pair_feature_dimension": 128,
      "latent_transformer_blocks": 5,
      "global_tokens": 10,
      "structure_layers": 8,
      "ipa_heads": 12,
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie3_config_code",
            "role": "configuration_evidence",
            "locator": "config"
          },
          {
            "source_ref": "genie3_ddim_code",
            "role": "implementation_evidence",
            "locator": "DDIMSampler._step"
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/genie3.yaml",
    "sources": [
      {
        "source_ref": "genie3_2026",
        "role": "architecture_description"
      },
      {
        "source_ref": "genie3_model_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "genie3_sampler_code",
        "role": "sampling_implementation"
      },
      {
        "source_ref": "genie3_diffusion_code",
        "role": "training_implementation"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie3_sampler_code",
            "role": "implementation_evidence",
            "locator": "Sampler.sample",
            "note": "The source set accounts for feature preparation, reverse diffusion, optional sequence sampling, and PDB postprocessing."
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
            "modules.diffusion_sampler",
            "modules.pdb_exporter"
          ]
        },
        "modules.feature_builder": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.task_source_router",
            "modules.unconditional_featurizer",
            "modules.motif_featurizer",
            "modules.target_featurizer",
            "modules.feature_batch_assembler"
          ]
        },
        "modules.diffusion_sampler": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.coordinate_initializer",
            "modules.reverse_diffusion_step",
            "modules.sequence_sampler"
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
        "modules.reverse_diffusion_step": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 4,
          "immediateModuleRefs": [
            "modules.timestep_controller",
            "modules.frenet_frame_builder",
            "modules.denoiser",
            "modules.directional_ddim_sampler_math"
          ]
        },
        "modules.timestep_controller": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.frenet_frame_builder": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.denoiser": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.single_feature_embedder",
            "modules.pair_feature_embedder",
            "modules.latent_transformer",
            "modules.sequence_head",
            "modules.structure_decoder"
          ]
        },
        "modules.directional_ddim_sampler_math": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.noise_readout",
            "modules.ddim_update"
          ]
        },
        "modules.noise_readout": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.ddim_update": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.sequence_sampler": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_feature_embedder": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_feature_embedder": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.latent_transformer": {
          "status": "complete",
          "depth": 4,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.global_token_adapter",
            "modules.pair_biased_attention_update",
            "modules.single_to_pair_update",
            "modules.triangle_multiplication_stack",
            "modules.pair_transition"
          ]
        },
        "modules.sequence_head": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_decoder": {
          "status": "complete",
          "depth": 4,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.invariant_point_attention",
            "modules.structure_transition",
            "modules.frame_update"
          ]
        },
        "modules.global_token_adapter": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_biased_attention_update": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_to_pair_update": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.triangle_multiplication_stack": {
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
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_transition": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.frame_update": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.task_source_router": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.unconditional_featurizer": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.unconditional_token_layout",
            "modules.unconditional_placeholder_initializer",
            "modules.unconditional_frame_indices"
          ]
        },
        "modules.motif_featurizer": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 4,
          "immediateModuleRefs": [
            "modules.motif_problem_parser",
            "modules.motif_scaffold_tokens",
            "modules.motif_conditioned_tokens",
            "modules.motif_feature_assembler"
          ]
        },
        "modules.target_featurizer": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 4,
          "immediateModuleRefs": [
            "modules.target_problem_parser",
            "modules.binder_tokens",
            "modules.target_conditioned_tokens",
            "modules.binder_target_feature_assembler"
          ]
        },
        "modules.feature_batch_assembler": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.unconditional_token_layout": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.unconditional_placeholder_initializer": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.unconditional_frame_indices": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.motif_problem_parser": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.motif_scaffold_tokens": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.motif_conditioned_tokens": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.motif_feature_assembler": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.target_problem_parser": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.binder_tokens": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.target_conditioned_tokens": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.binder_target_feature_assembler": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 42,
        "expandedScopeCount": 11,
        "completeExpandedScopeCount": 11,
        "partialScopeCount": 0,
        "leafFrontierCount": 31,
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
          "status": "complete"
        },
        "label": "Task Feature Builder",
        "kind": "adapter",
        "mechanisms": [
          "task_featurization"
        ],
        "role": "select the request-specific feature path, construct token and atom metadata with conditioning masks, and assemble a padded model batch",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length, create_np_features_from_motif_config, create_np_features_from_target_config, batchify_np_features, and prepare_tensor_features"
            }
          ]
        }
      },
      {
        "id": "diffusion_sampler",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Genie 3 Diffusion Sampler",
        "kind": "sampler",
        "mechanisms": [
          "reverse_diffusion",
          "directional_ddim"
        ],
        "role": "initialize random token coordinates and run the default 100-step directional DDIM reverse chain",
        "scale": "token",
        "repeats": 100,
        "pseudocode_ref": "../../pseudocode/genie3.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
        "label": "Protein PDB Exporter",
        "kind": "serializer",
        "role": "combine generated token coordinates with conditioned or optionally predicted identities and write PDB structures",
        "scale": "output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save"
            }
          ]
        }
      },
      {
        "id": "coordinate_initializer",
        "parent_ref": "modules.diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Gaussian Coordinate Initializer",
        "kind": "sampler",
        "mechanisms": [
          "gaussian_initialization"
        ],
        "role": "sample one standard-normal coordinate for every active C-alpha or atomized heavy-atom token",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_step",
        "parent_ref": "modules.diffusion_sampler",
        "decomposition": {
          "status": "complete"
        },
        "label": "Directional DDIM Reverse Step",
        "kind": "sampler",
        "mechanisms": [
          "directional_ddim"
        ],
        "role": "select one reverse timestep, rebuild frames, call the learned denoiser, recover predicted coordinate noise, and apply the fixed directional DDIM update",
        "scale": "token",
        "pseudocode_ref": "../../pseudocode/genie3.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "timestep_controller",
        "parent_ref": "modules.reverse_diffusion_step",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Strided Timestep Controller",
        "kind": "controller",
        "mechanisms": [
          "timestep_schedule"
        ],
        "role": "provide the current reverse index from 100 descending noise levels selected from the 1000-step training schedule",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "frenet_frame_builder",
        "parent_ref": "modules.reverse_diffusion_step",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Branched Frenet Frame Builder",
        "kind": "adapter",
        "mechanisms": [
          "frenet_frames"
        ],
        "role": "derive rotations along C-alpha and atom14-ordered sidechain traces while preserving current coordinate translations",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames and compute_frenet_frames"
            }
          ]
        }
      },
      {
        "id": "denoiser",
        "parent_ref": "modules.reverse_diffusion_step",
        "decomposition": {
          "status": "complete"
        },
        "label": "V1 SE(3)-Equivariant Denoiser",
        "kind": "denoiser",
        "role": "map current frames, timestep, and task features to denoised token coordinates plus optional sequence logits",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_model_code",
              "role": "implementation_evidence",
              "locator": "V1Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "directional_ddim_sampler_math",
        "parent_ref": "modules.reverse_diffusion_step",
        "decomposition": {
          "status": "complete"
        },
        "label": "Fixed Directional DDIM Math",
        "kind": "sampler",
        "mechanisms": [
          "vector_difference",
          "directional_ddim",
          "gaussian_noise"
        ],
        "role": "convert the denoiser coordinate estimate into a denoising direction and apply the fixed schedule formula to sample the next coordinate state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "noise_readout",
        "parent_ref": "modules.directional_ddim_sampler_math",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Coordinate Noise Readout",
        "kind": "operator",
        "mechanisms": [
          "vector_difference"
        ],
        "role": "subtract the denoiser coordinate estimate from x_t to recover predicted coordinate noise",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "ddim_update",
        "parent_ref": "modules.directional_ddim_sampler_math",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Directional DDIM Update",
        "kind": "operator",
        "mechanisms": [
          "directional_ddim"
        ],
        "role": "combine reconstructed x_0, scaled denoising direction, and Gaussian noise into x_(t-10)",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "sequence_sampler",
        "parent_ref": "modules.diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Optional Sequence Sampler",
        "kind": "sampler",
        "mechanisms": [
          "categorical_sampling"
        ],
        "role": "after structure sampling, make a final model call and sample residue identities when sequence prediction is enabled",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_feature_embedder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single-Feature Embedder",
        "kind": "encoder",
        "role": "project token, residue, chain, atom, timestep, and task-conditioning metadata into 384-dimensional single features",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_feature_embedder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair-Feature Embedder",
        "kind": "encoder",
        "role": "combine single outer sums, relative indices, noisy frame geometry, and conditioned geometry into 128-dimensional pair features",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            },
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "latent_transformer",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "Bidirectional Latent Transformer",
        "kind": "refiner",
        "mechanisms": [
          "attention",
          "outer_product",
          "triangular_multiplication"
        ],
        "role": "refine single and pair states through five blocks with communication in both directions at every block",
        "scale": "mixed",
        "repeats": 5,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "sequence_head",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Optional Sequence Head",
        "kind": "prediction_head",
        "mechanisms": [
          "classification"
        ],
        "role": "map refined single features to 20 amino-acid logits per token",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "structure_decoder",
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
        "role": "use eight IPA layers to update invariant single states and compose rigid increments into the input frames",
        "scale": "token",
        "repeats": 8,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "global_token_adapter",
        "parent_ref": "modules.latent_transformer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Global Token Adapter",
        "kind": "adapter",
        "mechanisms": [
          "global_tokens"
        ],
        "role": "append ten zero-initialized global tokens and remove them after latent reasoning",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_biased_attention_update",
        "parent_ref": "modules.latent_transformer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair-Biased Single Attention",
        "kind": "attention",
        "mechanisms": [
          "pair_biased_attention",
          "pair_value_injection"
        ],
        "role": "update single features using pair-biased self-attention with pair-derived value injection and no frame geometry",
        "scale": "token",
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "heads": 12,
          "pair_bias": true,
          "pair_bias_source": "pair_with_global_tokens",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "single_to_pair_update",
        "parent_ref": "modules.latent_transformer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single-to-Pair Outer Product",
        "kind": "operator",
        "mechanisms": [
          "outer_product"
        ],
        "role": "project the updated single state into a residual pair update",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_stack",
        "parent_ref": "modules.latent_transformer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Outgoing + Incoming Triangle Updates",
        "kind": "operator",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "apply row-dropped outgoing and incoming triangular multiplication updates to the pair state",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition",
        "parent_ref": "modules.latent_transformer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair Transition",
        "kind": "feed_forward",
        "role": "apply the residual pair-wise transition at the end of each latent block",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "invariant_point_attention",
        "parent_ref": "modules.structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Invariant Point Attention",
        "kind": "attention",
        "mechanisms": [
          "invariant_point_attention"
        ],
        "role": "update the decoder single state using pair bias and points expressed in the current token frames",
        "scale": "token",
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "structure_transition",
        "parent_ref": "modules.structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Structure Transition",
        "kind": "feed_forward",
        "role": "normalize and transform the IPA-updated single state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "frame_update",
        "parent_ref": "modules.structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Token Frame Update",
        "kind": "operator",
        "mechanisms": [
          "rigid_transform"
        ],
        "role": "regress and compose a six-parameter rigid increment for every valid token frame",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "task_source_router",
        "parent_ref": "modules.feature_builder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Task Source Router",
        "kind": "controller",
        "mechanisms": [
          "source_dispatch"
        ],
        "role": "select one generation feature path from the configured unconditional, motif, or target source",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            }
          ]
        }
      },
      {
        "id": "unconditional_featurizer",
        "parent_ref": "modules.feature_builder",
        "decomposition": {
          "status": "complete"
        },
        "label": "Unconditional Generation Task Featurizer",
        "kind": "adapter",
        "mechanisms": [
          "length_tokenization"
        ],
        "role": "turn a requested length into unknown C-alpha tokens with sequence, structure, and interface conditioning disabled",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length"
            }
          ]
        }
      },
      {
        "id": "motif_featurizer",
        "parent_ref": "modules.feature_builder",
        "decomposition": {
          "status": "complete"
        },
        "label": "Motif Scaffolding Task Featurizer",
        "kind": "adapter",
        "mechanisms": [
          "motif_tokenization",
          "partial_atomization"
        ],
        "role": "combine unknown scaffold C-alpha tokens with known motif sequence and coordinates, atomizing known motif residues when requested",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config"
            }
          ]
        }
      },
      {
        "id": "target_featurizer",
        "parent_ref": "modules.feature_builder",
        "decomposition": {
          "status": "complete"
        },
        "label": "Binder Design Task Featurizer",
        "kind": "adapter",
        "mechanisms": [
          "binder_target_tokenization",
          "interface_conditioning",
          "partial_atomization"
        ],
        "role": "combine unknown binder tokens with conditioned target chains and selected target-interface annotations",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config"
            }
          ]
        }
      },
      {
        "id": "feature_batch_assembler",
        "parent_ref": "modules.feature_builder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Feature Batch Assembler",
        "kind": "adapter",
        "mechanisms": [
          "feature_padding",
          "batch_stacking",
          "tensor_preparation"
        ],
        "role": "pad source-specific feature dictionaries to common token and atom lengths, stack the batch, and prepare typed tensors",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "batchify_np_features and prepare_tensor_features"
            }
          ]
        }
      },
      {
        "id": "unconditional_token_layout",
        "parent_ref": "modules.unconditional_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "C-alpha Token Layout",
        "kind": "adapter",
        "mechanisms": [
          "length_tokenization"
        ],
        "role": "create one active C-alpha token with token, residue, and chain indices for every requested residue",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length"
            }
          ]
        }
      },
      {
        "id": "unconditional_placeholder_initializer",
        "parent_ref": "modules.unconditional_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Unknown Feature Initializer",
        "kind": "adapter",
        "mechanisms": [
          "placeholder_initialization",
          "conditioning_mask_initialization"
        ],
        "role": "mark residue identities and conditioning coordinates as unknown placeholders and disable all task-conditioning masks",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length"
            }
          ]
        }
      },
      {
        "id": "unconditional_frame_indices",
        "parent_ref": "modules.unconditional_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Frame Index Features",
        "kind": "adapter",
        "mechanisms": [
          "frame_index_derivation"
        ],
        "role": "derive neighboring token indices and validity masks used to construct local frames later",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length, _update_np_features_on_token_frame_index, and _update_np_features_on_token_struct_frame_mask"
            }
          ]
        }
      },
      {
        "id": "motif_problem_parser",
        "parent_ref": "modules.motif_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Motif Problem Parser",
        "kind": "controller",
        "mechanisms": [
          "motif_config_sampling"
        ],
        "role": "load motif structures and resolve the ordered scaffold-length and motif-segment layout for this sample",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config and _sample_motif_config"
            }
          ]
        }
      },
      {
        "id": "motif_scaffold_tokens",
        "parent_ref": "modules.motif_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Scaffold Token Builder",
        "kind": "adapter",
        "mechanisms": [
          "length_tokenization"
        ],
        "role": "turn every numeric scaffold segment into unknown C-alpha tokens with conditioning masks disabled",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config scaffold branch"
            }
          ]
        }
      },
      {
        "id": "motif_conditioned_tokens",
        "parent_ref": "modules.motif_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Conditioned Motif Token Builder",
        "kind": "adapter",
        "mechanisms": [
          "motif_tokenization",
          "partial_atomization"
        ],
        "role": "encode known motif identities and coordinates, expanding motif residues into C-alpha plus side-chain heavy-atom tokens in Atom14 mode",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config motif branch"
            }
          ]
        }
      },
      {
        "id": "motif_feature_assembler",
        "parent_ref": "modules.motif_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Motif Feature Assembler",
        "kind": "adapter",
        "mechanisms": [
          "segment_concatenation",
          "frame_index_derivation"
        ],
        "role": "restore scaffold and motif segments to their requested order and derive frame and conditioning-frame masks",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config"
            }
          ]
        }
      },
      {
        "id": "target_problem_parser",
        "parent_ref": "modules.target_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Binder Design Problem Parser",
        "kind": "controller",
        "mechanisms": [
          "target_config_parsing",
          "interface_selection"
        ],
        "role": "read the binder specification, target PDB, and selected target-interface residue list",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config and _sample_interface_residues"
            }
          ]
        }
      },
      {
        "id": "binder_tokens",
        "parent_ref": "modules.target_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Binder Token Builder",
        "kind": "adapter",
        "mechanisms": [
          "length_tokenization"
        ],
        "role": "create the unknown binder region from a requested length or conditioned binder framework",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config binder features"
            }
          ]
        }
      },
      {
        "id": "target_conditioned_tokens",
        "parent_ref": "modules.target_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Conditioned Target Token Builder",
        "kind": "adapter",
        "mechanisms": [
          "target_tokenization",
          "interface_conditioning",
          "partial_atomization"
        ],
        "role": "encode conditioned target C-alpha structure and selectively atomize marked interface residues in Atom14 mode",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config target features and create_np_features_from_chain"
            }
          ]
        }
      },
      {
        "id": "binder_target_feature_assembler",
        "parent_ref": "modules.target_featurizer",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Binder + Target Assembler",
        "kind": "adapter",
        "mechanisms": [
          "chain_concatenation",
          "target_centering"
        ],
        "role": "concatenate binder and target feature dictionaries with distinct chain identities and center coordinates on the target",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config, concatenate_np_features, and update_np_features_with_ca_centering"
            }
          ]
        }
      }
    ],
    "blockInstances": [
      {
        "id": "latent_reduced_pair_attention",
        "standardBlockId": "pair_biased_attention",
        "standardBlockRef": "standard_blocks/pair-biased-attention.yaml",
        "standardBlockName": "Pair-Biased Attention",
        "subjectRef": "modules.pair_biased_attention_update",
        "variant": "pair_values_residual_norm_transition",
        "variantLabel": "Reduced pair attention + wrapper",
        "variantDescription": "A reduced IPA-style path adds pair bias, aggregates pair values, then applies residual normalization, a transition, and output masking.",
        "useScope": "whole_module",
        "conformance": "reduced",
        "differenceSummary": "Genie 3 removes frame-aware point terms, keeps pair-logit bias and pair-value aggregation, then adds residual normalization, a single transition, and final masking.",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_ipa_code",
              "role": "implementation_evidence",
              "locator": "ReducedInvariantPointAttention.forward",
              "note": "Reduced IPA implements scalar attention with pair bias and pair-value aggregation while omitting frame-aware point terms."
            },
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "wrapper_evidence",
              "locator": "LatentTransformerBlock.forward",
              "note": "The latent block applies the residual normalization, transition, and output mask around ReducedIPA."
            }
          ]
        },
        "portBindings": [
          {
            "portRef": "ports.single_state",
            "relationRefs": [
              "relations.single_with_global_tokens_enters_attention"
            ],
            "relations": [
              {
                "relationRef": "relations.single_with_global_tokens_enters_attention",
                "from": "value_sites.single_with_global_tokens",
                "to": "modules.pair_biased_attention_update",
                "kind": "data_flow",
                "operation": "attend_over_single_state",
                "carries": [
                  "representations.single_features"
                ]
              }
            ]
          },
          {
            "portRef": "ports.pair_context",
            "relationRefs": [
              "relations.pair_with_global_tokens_bias_attention"
            ],
            "relations": [
              {
                "relationRef": "relations.pair_with_global_tokens_bias_attention",
                "from": "value_sites.pair_with_global_tokens",
                "to": "modules.pair_biased_attention_update",
                "kind": "conditioning",
                "operation": "bias_attention_and_inject_pair_values",
                "carries": [
                  "representations.pair_features"
                ]
              }
            ]
          },
          {
            "portRef": "ports.updated_single_state",
            "relationRefs": [
              "relations.pair_attention_produces_single_state"
            ],
            "relations": [
              {
                "relationRef": "relations.pair_attention_produces_single_state",
                "from": "modules.pair_biased_attention_update",
                "to": "value_sites.single_after_pair_attention",
                "kind": "state_update",
                "operation": "residual_single_update",
                "carries": [
                  "representations.single_features"
                ]
              }
            ]
          }
        ],
        "pseudocode": [
          {
            "id": "project_qkv",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "label": "Project Q, K, and V",
            "operation": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.queries",
              "values.keys",
              "values.scalar_values"
            ]
          },
          {
            "id": "scalar_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "label": "Form query-key logits",
            "operation": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "inputs": [
              "values.queries",
              "values.keys"
            ],
            "outputs": [
              "values.scalar_logits"
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ]
          },
          {
            "id": "combine_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "label": "Add pair bias",
            "operation": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "inputs": [
              "values.scalar_logits",
              "values.pair_bias"
            ],
            "outputs": [
              "values.biased_logits"
            ]
          },
          {
            "id": "apply_attention_mask",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "label": "Apply attention mask",
            "operation": "attention_mask",
            "code": "masked_logits = biased_logits + mask_bias(attention_mask)",
            "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}",
            "inputs": [
              "values.biased_logits",
              "ports.attention_mask"
            ],
            "outputs": [
              "values.masked_logits"
            ]
          },
          {
            "id": "softmax_attention_masked",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
            "label": "Normalize masked attention",
            "operation": "softmax",
            "code": "attention = softmax(masked_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell^m_{ijh})",
            "inputs": [
              "values.masked_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "inputs": [
              "values.attention_weights",
              "values.scalar_values"
            ],
            "outputs": [
              "values.scalar_context"
            ]
          },
          {
            "id": "aggregate_pair_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "label": "Aggregate pair values",
            "operation": "pair_value_aggregation",
            "code": "pair_context_out = einsum(attention, pair_context)",
            "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}",
            "inputs": [
              "values.attention_weights",
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_value_context"
            ]
          },
          {
            "id": "project_reduced_output",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "label": "Fuse scalar and pair contexts",
            "operation": "output_projection",
            "code": "attention_delta = output_projection(concat(scalar_context, pair_context_out))",
            "inputs": [
              "values.scalar_context",
              "values.pair_value_context"
            ],
            "outputs": [
              "values.attention_delta"
            ]
          },
          {
            "id": "residual_norm",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "label": "Residual, dropout, and norm",
            "operation": "residual_normalization",
            "code": "normalized_single = layer_norm(single_state + dropout(attention_delta))",
            "inputs": [
              "ports.single_state",
              "values.attention_delta"
            ],
            "outputs": [
              "values.normalized_single"
            ]
          },
          {
            "id": "transition_and_mask",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "label": "Transition and mask",
            "operation": "transition_mask",
            "code": "updated_single_state = transition(normalized_single) * attention_mask",
            "inputs": [
              "values.normalized_single",
              "ports.attention_mask"
            ],
            "outputs": [
              "ports.updated_single_state"
            ]
          }
        ]
      },
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
              "source_ref": "genie3_ipa_code",
              "role": "implementation_evidence",
              "locator": "InvariantPointAttention.forward",
              "note": "Full IPA implements scalar, point, pair-bias, and pair-value attention terms."
            },
            {
              "source_ref": "genie3_structure_code",
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
              "relations.decoder_single_state_enters_ipa"
            ],
            "relations": [
              {
                "relationRef": "relations.decoder_single_state_enters_ipa",
                "from": "value_sites.decoder_single_state",
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
              "relations.decoder_frames_condition_ipa"
            ],
            "relations": [
              {
                "relationRef": "relations.decoder_frames_condition_ipa",
                "from": "value_sites.decoder_frames",
                "to": "modules.invariant_point_attention",
                "kind": "conditioning",
                "operation": "express_attention_points_in_frames",
                "carries": [
                  "representations.token_frames"
                ]
              }
            ]
          },
          {
            "portRef": "ports.mask",
            "relationRefs": [
              "relations.feature_bundle_masks_ipa"
            ],
            "selector": "token_struct_frame_mask",
            "relations": [
              {
                "relationRef": "relations.feature_bundle_masks_ipa",
                "from": "value_sites.feature_bundle",
                "to": "modules.invariant_point_attention",
                "kind": "conditioning",
                "operation": "mask_invalid_token_frames",
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
        "id": "design_request",
        "scale": "sample",
        "semantic_role": "unconditional, motif-scaffolding, or binder-design request",
        "shape": "B x request metadata",
        "carries": [
          "target length or conditional structure specification",
          "optional motif groups, target chains, and hotspot/interface annotations"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length, create_np_features_from_motif_config, and create_np_features_from_target_config"
            }
          ]
        }
      },
      {
        "id": "feature_bundle",
        "scale": "mixed",
        "semantic_role": "model-ready dictionary of token- and atom-indexed metadata, known values, and task-dependent conditioning masks",
        "shape": "B x N token fields + B x A atom fields",
        "carries": [
          "token, residue, chain, entity, and atom identities",
          "known residue types and coordinates plus atomization and validity masks",
          "conditioning group, sequence, structure, frame, and interface masks"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
            },
            {
              "source_ref": "genie3_feature_schema_code",
              "role": "schema_evidence",
              "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
            }
          ]
        },
        "glyph": "dictionary",
        "field_groups": [
          {
            "id": "layout_and_identity",
            "label": "Layout and identity",
            "axis": "token",
            "shape": "B x N",
            "fields": [
              "token_mask",
              "token_index",
              "residue_index",
              "asym_id",
              "sym_id",
              "entity_id",
              "is_atomized"
            ],
            "semantic_role": "Defines which padded token slots are active, maps them to residues and chains, and marks tokens created by partial atomization.",
            "task_behavior": "Present for every task; the selected featurizer determines the token count, chain layout, and atomization flags.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          },
          {
            "id": "residue_identity",
            "label": "Known residue identity",
            "axis": "token",
            "shape": "B x N x residue type",
            "fields": [
              "gt_restype"
            ],
            "semantic_role": "Carries the one-hot amino-acid identity available at each token position.",
            "task_behavior": "Unknown design positions are zeroed; conditioned motif or target residues retain known identities.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          },
          {
            "id": "atom_identity_and_coordinates",
            "label": "Atom identity and coordinates",
            "axis": "atom",
            "shape": "B x A, with categorical or xyz trailing dimensions",
            "fields": [
              "atom_type",
              "atom_symbol",
              "gt_atom_mask",
              "gt_atom_positions"
            ],
            "semantic_role": "Describes each atom row, whether it is valid, and its available three-dimensional coordinate.",
            "task_behavior": "Every residue contributes a C-alpha row; selected known residues may contribute additional Atom14 side-chain heavy-atom rows.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          },
          {
            "id": "frame_construction",
            "label": "Frame construction",
            "axis": "token",
            "shape": "B x N",
            "fields": [
              "token_struct_mask",
              "token_struct_frame_mask",
              "token_frame_lindex",
              "token_frame_rindex",
              "token_frame_cindex_adj",
              "token_frame_lindex_adj",
              "token_frame_rindex_adj"
            ],
            "semantic_role": "Identifies structurally valid tokens and their neighboring token indices for local-frame construction.",
            "task_behavior": "Indices exist in every task; validity masks determine where current or conditioned frames may actually be used.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          },
          {
            "id": "task_conditioning",
            "label": "Task conditioning",
            "axis": "token",
            "shape": "B x N",
            "fields": [
              "cond_seq_mask",
              "cond_group",
              "cond_struct_mask",
              "cond_struct_frame_mask",
              "cond_interface_mask"
            ],
            "semantic_role": "States which token identities, coordinates, frames, motif groups, and target-interface positions are exposed to the model.",
            "task_behavior": "Disabled for unconditional generation, set on known motif positions for scaffolding, and set on target or interface positions for binder design.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          },
          {
            "id": "source_confidence",
            "label": "Source confidence",
            "axis": "token",
            "shape": "B x N",
            "fields": [
              "plddt"
            ],
            "semantic_role": "Preserves per-token confidence supplied by an input structure when that field is available.",
            "task_behavior": "Relevant to structure-sourced motif and target examples; it is not created by the length-only unconditional path.",
            "evidence": {
              "status": "confirmed_from_code",
              "refs": [
                {
                  "source_ref": "genie3_feature_code",
                  "role": "implementation_evidence",
                  "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
                },
                {
                  "source_ref": "genie3_feature_schema_code",
                  "role": "schema_evidence",
                  "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "token_coordinates",
        "scale": "token",
        "semantic_role": "point-cloud diffusion state over C-alpha and optionally atomized heavy-atom tokens",
        "shape": "B x N x 3",
        "carries": [
          "one three-dimensional coordinate per active token"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "glyph": "coordinates"
      },
      {
        "id": "token_frames",
        "scale": "token",
        "semantic_role": "Frenet-Serret frames derived along C-alpha and atom14-ordered sidechain traces",
        "shape": "B x N x (3 x 3 + 3)",
        "carries": [
          "derived rotation",
          "current token translation"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames and compute_frenet_frames"
            }
          ]
        },
        "glyph": "frames"
      },
      {
        "id": "timestep",
        "scale": "sample",
        "semantic_role": "selected diffusion noise level",
        "shape": "B",
        "carries": [
          "one of 100 selected reverse steps from the 1000-step schedule"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "coordinate_noise",
        "scale": "token",
        "semantic_role": "predicted or sampled coordinate noise",
        "shape": "B x N x 3",
        "carries": [
          "one displacement vector per active token"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "single_features",
        "scale": "token",
        "semantic_role": "SE(3)-invariant per-token latent state",
        "shape": "B x N x 384",
        "carries": [
          "token, residue, chain, atom, timestep, and task-conditioning features"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_features",
        "scale": "pair",
        "semantic_role": "SE(3)-invariant token-pair latent state",
        "shape": "B x N x N x 128",
        "carries": [
          "relative index and chain features",
          "noisy and conditioned frame geometry",
          "learned single-to-pair communication"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            },
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "sequence_logits",
        "scale": "token",
        "semantic_role": "optional amino-acid logits for C-alpha tokens",
        "shape": "B x N x 20",
        "carries": [
          "categorical residue-type scores"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "protein_sequence",
        "scale": "residue",
        "semantic_role": "optional sampled amino-acid identities",
        "shape": "B x R",
        "carries": [
          "one residue type per designed residue"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "protein_pdb",
        "scale": "output",
        "semantic_role": "serialized generated protein design",
        "shape": "modeled atom records",
        "carries": [
          "generated coordinates",
          "conditioned or optionally predicted residue identities"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save"
            }
          ]
        }
      },
      {
        "id": "sample_feature_dictionary",
        "scale": "mixed",
        "semantic_role": "one source-specific unbatched dictionary of token- and atom-indexed features",
        "shape": "N token fields + A atom fields",
        "glyph": "single",
        "carries": [
          "task-specific token and atom layout",
          "known sequence and coordinate values",
          "sequence, structure, frame, motif-group, and interface conditioning masks"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length, create_np_features_from_motif_config, and create_np_features_from_target_config"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "design_request",
        "representation_ref": "representations.design_request",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length, create_np_features_from_motif_config, and create_np_features_from_target_config"
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
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain, batchify_np_features, and prepare_tensor_features"
            },
            {
              "source_ref": "genie3_feature_schema_code",
              "role": "schema_evidence",
              "locator": "FEATURES, FEATURE_LEVEL, and FEATURE_DTYPE"
            }
          ]
        }
      },
      {
        "id": "initial_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.diffusion_sampler",
        "role": "initial_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "current_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.diffusion_sampler",
        "role": "state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "step_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.reverse_diffusion_step",
        "role": "reverse_step_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "current_frames",
        "representation_ref": "representations.token_frames",
        "scope_ref": "modules.denoiser",
        "role": "derived_model_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames and compute_frenet_frames"
            }
          ]
        }
      },
      {
        "id": "timestep",
        "representation_ref": "representations.timestep",
        "scope_ref": "modules.reverse_diffusion_step",
        "role": "loop_control",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "coordinate_prediction",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.denoiser",
        "role": "denoised_coordinate_estimate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_model_code",
              "role": "implementation_evidence",
              "locator": "V1Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "sampler_step_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.directional_ddim_sampler_math",
        "role": "fixed_sampler_math_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "predicted_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.directional_ddim_sampler_math",
        "role": "model_prediction",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "fresh_step_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.directional_ddim_sampler_math",
        "role": "stochastic_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "next_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "modules.diffusion_sampler",
        "role": "state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "final_coordinates",
        "representation_ref": "representations.token_coordinates",
        "scope_ref": "architecture",
        "role": "sampler_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "initial_single_features",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.denoiser",
        "role": "embedder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.denoiser",
        "role": "embedder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            },
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "single_with_global_tokens",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.latent_transformer",
        "role": "latent_block_single_state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_with_global_tokens",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.latent_transformer",
        "role": "latent_block_pair_state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_pair_attention",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.latent_transformer",
        "role": "latent_block_single_state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_single_update",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.latent_transformer",
        "role": "single_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_triangle_updates",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.latent_transformer",
        "role": "triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_transition",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.latent_transformer",
        "role": "latent_block_pair_state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_single_features",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.denoiser",
        "role": "latent_transformer_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.denoiser",
        "role": "latent_transformer_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_single_state",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.structure_decoder",
        "role": "structure_layer_state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_frames",
        "representation_ref": "representations.token_frames",
        "scope_ref": "modules.structure_decoder",
        "role": "structure_layer_frame_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_ipa",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.structure_decoder",
        "role": "attention_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_transition",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.structure_decoder",
        "role": "transition_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames",
        "representation_ref": "representations.token_frames",
        "scope_ref": "modules.structure_decoder",
        "role": "frame_state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_output_frames",
        "representation_ref": "representations.token_frames",
        "scope_ref": "modules.denoiser",
        "role": "structure_decoder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "sequence_logits",
        "representation_ref": "representations.sequence_logits",
        "scope_ref": "modules.denoiser",
        "role": "optional_model_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "predicted_sequence",
        "representation_ref": "representations.protein_sequence",
        "scope_ref": "architecture",
        "role": "optional_sampler_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            }
          ]
        }
      },
      {
        "id": "generated_design_pdb",
        "representation_ref": "representations.protein_pdb",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "design_request": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.design_request_enters_feature_builder"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.task_source_router"
        ]
      },
      "feature_bundle": {
        "incomingRelationRefs": [
          "relations.feature_builder_produces_feature_bundle"
        ],
        "outgoingRelationRefs": [
          "relations.feature_bundle_sizes_coordinate_initializer",
          "relations.feature_bundle_conditions_frame_builder",
          "relations.feature_bundle_conditions_single_embedder",
          "relations.feature_bundle_conditions_pair_embedder",
          "relations.feature_bundle_masks_ipa",
          "relations.feature_bundle_conditions_sequence_sampler"
        ],
        "producerRefs": [
          "modules.feature_batch_assembler"
        ],
        "consumerRefs": [
          "modules.coordinate_initializer",
          "modules.frenet_frame_builder",
          "modules.single_feature_embedder",
          "modules.pair_feature_embedder",
          "modules.invariant_point_attention",
          "modules.sequence_sampler"
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
          "relations.current_coordinates_enter_reverse_step"
        ],
        "producerRefs": [
          "value_sites.initial_coordinates",
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "value_sites.step_coordinates"
        ]
      },
      "step_coordinates": {
        "incomingRelationRefs": [
          "relations.current_coordinates_enter_reverse_step"
        ],
        "outgoingRelationRefs": [
          "relations.step_coordinates_enter_frame_builder",
          "relations.step_coordinates_enter_sampler_math"
        ],
        "producerRefs": [
          "value_sites.current_coordinates"
        ],
        "consumerRefs": [
          "modules.frenet_frame_builder",
          "value_sites.sampler_step_coordinates"
        ]
      },
      "current_frames": {
        "incomingRelationRefs": [
          "relations.frame_builder_produces_current_frames"
        ],
        "outgoingRelationRefs": [
          "relations.current_frames_enter_pair_embedder",
          "relations.current_frames_initialize_decoder_frames"
        ],
        "producerRefs": [
          "modules.frenet_frame_builder"
        ],
        "consumerRefs": [
          "modules.pair_feature_embedder",
          "value_sites.decoder_frames"
        ]
      },
      "timestep": {
        "incomingRelationRefs": [
          "relations.timestep_controller_produces_timestep"
        ],
        "outgoingRelationRefs": [
          "relations.timestep_conditions_single_embedder",
          "relations.timestep_enters_ddim_update"
        ],
        "producerRefs": [
          "modules.timestep_controller"
        ],
        "consumerRefs": [
          "modules.single_feature_embedder",
          "modules.ddim_update"
        ]
      },
      "coordinate_prediction": {
        "incomingRelationRefs": [
          "relations.updated_frames_produce_coordinate_prediction"
        ],
        "outgoingRelationRefs": [
          "relations.coordinate_prediction_enters_noise_readout"
        ],
        "producerRefs": [
          "value_sites.decoder_output_frames"
        ],
        "consumerRefs": [
          "modules.noise_readout"
        ]
      },
      "sampler_step_coordinates": {
        "incomingRelationRefs": [
          "relations.step_coordinates_enter_sampler_math"
        ],
        "outgoingRelationRefs": [
          "relations.sampler_coordinates_enter_noise_readout",
          "relations.sampler_coordinates_enter_ddim_update"
        ],
        "producerRefs": [
          "value_sites.step_coordinates"
        ],
        "consumerRefs": [
          "modules.noise_readout",
          "modules.ddim_update"
        ]
      },
      "predicted_noise": {
        "incomingRelationRefs": [
          "relations.noise_readout_produces_predicted_noise"
        ],
        "outgoingRelationRefs": [
          "relations.predicted_noise_enters_ddim_update"
        ],
        "producerRefs": [
          "modules.noise_readout"
        ],
        "consumerRefs": [
          "modules.ddim_update"
        ]
      },
      "fresh_step_noise": {
        "incomingRelationRefs": [
          "relations.ddim_update_samples_fresh_noise"
        ],
        "outgoingRelationRefs": [
          "relations.fresh_noise_reenters_ddim_update"
        ],
        "producerRefs": [
          "modules.ddim_update"
        ],
        "consumerRefs": [
          "modules.ddim_update"
        ]
      },
      "next_coordinates": {
        "incomingRelationRefs": [
          "relations.ddim_update_produces_next_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.next_coordinates_reenter_sampling_state",
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "producerRefs": [
          "modules.ddim_update"
        ],
        "consumerRefs": [
          "value_sites.current_coordinates",
          "value_sites.final_coordinates"
        ]
      },
      "final_coordinates": {
        "incomingRelationRefs": [
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.final_coordinates_enter_sequence_sampler",
          "relations.final_coordinates_enter_pdb_exporter"
        ],
        "producerRefs": [
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "modules.sequence_sampler",
          "modules.pdb_exporter"
        ]
      },
      "initial_single_features": {
        "incomingRelationRefs": [
          "relations.single_embedder_produces_initial_single_features"
        ],
        "outgoingRelationRefs": [
          "relations.initial_single_features_enter_pair_embedder",
          "relations.initial_single_features_enter_global_adapter"
        ],
        "producerRefs": [
          "modules.single_feature_embedder"
        ],
        "consumerRefs": [
          "modules.pair_feature_embedder",
          "modules.global_token_adapter"
        ]
      },
      "initial_pair_features": {
        "incomingRelationRefs": [
          "relations.pair_embedder_produces_initial_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.initial_pair_features_enter_global_adapter"
        ],
        "producerRefs": [
          "modules.pair_feature_embedder"
        ],
        "consumerRefs": [
          "modules.global_token_adapter"
        ]
      },
      "single_with_global_tokens": {
        "incomingRelationRefs": [
          "relations.global_adapter_produces_single_state",
          "relations.block_single_output_reenters_next_latent_block"
        ],
        "outgoingRelationRefs": [
          "relations.single_with_global_tokens_enters_attention"
        ],
        "producerRefs": [
          "modules.global_token_adapter",
          "value_sites.single_after_pair_attention"
        ],
        "consumerRefs": [
          "modules.pair_biased_attention_update"
        ]
      },
      "pair_with_global_tokens": {
        "incomingRelationRefs": [
          "relations.global_adapter_produces_pair_state",
          "relations.block_pair_output_reenters_next_latent_block"
        ],
        "outgoingRelationRefs": [
          "relations.pair_with_global_tokens_bias_attention",
          "relations.pair_with_global_tokens_enters_single_to_pair_update"
        ],
        "producerRefs": [
          "modules.global_token_adapter",
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [
          "modules.pair_biased_attention_update",
          "modules.single_to_pair_update"
        ]
      },
      "single_after_pair_attention": {
        "incomingRelationRefs": [
          "relations.pair_attention_produces_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.single_after_pair_attention_enters_single_to_pair_update",
          "relations.block_single_output_becomes_refined_single_features",
          "relations.block_single_output_reenters_next_latent_block"
        ],
        "producerRefs": [
          "modules.pair_biased_attention_update"
        ],
        "consumerRefs": [
          "modules.single_to_pair_update",
          "value_sites.refined_single_features",
          "value_sites.single_with_global_tokens"
        ]
      },
      "pair_after_single_update": {
        "incomingRelationRefs": [
          "relations.single_to_pair_update_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_after_single_update_enters_triangle_stack"
        ],
        "producerRefs": [
          "modules.single_to_pair_update"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_stack"
        ]
      },
      "pair_after_triangle_updates": {
        "incomingRelationRefs": [
          "relations.triangle_stack_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_after_triangle_updates_enter_transition"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_stack"
        ],
        "consumerRefs": [
          "modules.pair_transition"
        ]
      },
      "pair_after_transition": {
        "incomingRelationRefs": [
          "relations.pair_transition_produces_block_pair_output"
        ],
        "outgoingRelationRefs": [
          "relations.block_pair_output_becomes_refined_pair_features",
          "relations.block_pair_output_reenters_next_latent_block"
        ],
        "producerRefs": [
          "modules.pair_transition"
        ],
        "consumerRefs": [
          "value_sites.refined_pair_features",
          "value_sites.pair_with_global_tokens"
        ]
      },
      "refined_single_features": {
        "incomingRelationRefs": [
          "relations.block_single_output_becomes_refined_single_features"
        ],
        "outgoingRelationRefs": [
          "relations.refined_single_features_enter_sequence_head",
          "relations.refined_single_features_initialize_decoder_state"
        ],
        "producerRefs": [
          "value_sites.single_after_pair_attention"
        ],
        "consumerRefs": [
          "modules.sequence_head",
          "value_sites.decoder_single_state"
        ]
      },
      "refined_pair_features": {
        "incomingRelationRefs": [
          "relations.block_pair_output_becomes_refined_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.refined_pair_features_bias_ipa"
        ],
        "producerRefs": [
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [
          "modules.invariant_point_attention"
        ]
      },
      "decoder_single_state": {
        "incomingRelationRefs": [
          "relations.refined_single_features_initialize_decoder_state",
          "relations.transition_state_reenters_decoder"
        ],
        "outgoingRelationRefs": [
          "relations.decoder_single_state_enters_ipa"
        ],
        "producerRefs": [
          "value_sites.refined_single_features",
          "value_sites.single_after_transition"
        ],
        "consumerRefs": [
          "modules.invariant_point_attention"
        ]
      },
      "decoder_frames": {
        "incomingRelationRefs": [
          "relations.current_frames_initialize_decoder_frames",
          "relations.updated_frames_reenter_decoder"
        ],
        "outgoingRelationRefs": [
          "relations.decoder_frames_condition_ipa",
          "relations.decoder_frames_enter_frame_update"
        ],
        "producerRefs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "consumerRefs": [
          "modules.invariant_point_attention",
          "modules.frame_update"
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
          "relations.transition_state_enters_frame_update",
          "relations.transition_state_reenters_decoder"
        ],
        "producerRefs": [
          "modules.structure_transition"
        ],
        "consumerRefs": [
          "modules.frame_update",
          "value_sites.decoder_single_state"
        ]
      },
      "updated_frames": {
        "incomingRelationRefs": [
          "relations.frame_update_produces_updated_frames"
        ],
        "outgoingRelationRefs": [
          "relations.updated_frames_reenter_decoder",
          "relations.updated_frames_become_decoder_output_frames"
        ],
        "producerRefs": [
          "modules.frame_update"
        ],
        "consumerRefs": [
          "value_sites.decoder_frames",
          "value_sites.decoder_output_frames"
        ]
      },
      "decoder_output_frames": {
        "incomingRelationRefs": [
          "relations.updated_frames_become_decoder_output_frames"
        ],
        "outgoingRelationRefs": [
          "relations.updated_frames_produce_coordinate_prediction"
        ],
        "producerRefs": [
          "value_sites.updated_frames"
        ],
        "consumerRefs": [
          "value_sites.coordinate_prediction"
        ]
      },
      "sequence_logits": {
        "incomingRelationRefs": [
          "relations.sequence_head_produces_logits"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.sequence_head"
        ],
        "consumerRefs": [

        ]
      },
      "predicted_sequence": {
        "incomingRelationRefs": [
          "relations.sequence_sampler_produces_predicted_sequence"
        ],
        "outgoingRelationRefs": [
          "relations.predicted_sequence_enters_pdb_exporter"
        ],
        "producerRefs": [
          "modules.sequence_sampler"
        ],
        "consumerRefs": [
          "modules.pdb_exporter"
        ]
      },
      "generated_design_pdb": {
        "incomingRelationRefs": [
          "relations.pdb_exporter_writes_design_pdb"
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
          "repeats": 100,
          "reruns": [
            "modules.reverse_diffusion_step"
          ],
          "cached": [
            "value_sites.feature_bundle"
          ],
          "notes": [
            "The released inference path defaults to DDIM with 100 selected timesteps from the 1000-step training schedule.",
            "Frenet-Serret frames are reconstructed from the current token coordinates before every denoiser call."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_sampler_code",
                "role": "implementation_evidence",
                "locator": "Sampler.sample and Sampler._sample"
              },
              {
                "source_ref": "genie3_ddim_code",
                "role": "implementation_evidence",
                "locator": "DDIMSampler._step"
              }
            ]
          }
        },
        {
          "id": "latent_reasoning_stack",
          "repeats": 5,
          "reruns": [
            "modules.pair_biased_attention_update",
            "modules.single_to_pair_update",
            "modules.triangle_multiplication_stack",
            "modules.pair_transition"
          ],
          "cached": [

          ],
          "notes": [
            "Every block communicates pair information into singles, then singles back into pairs before triangular pair refinement.",
            "One block maps the indexed state pair (s_i, z_i) to (s_(i+1), z_(i+1)); for the first four blocks those writes become the next block's reads, and global tokens are removed only after block five."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_latent_transformer_code",
                "role": "implementation_evidence",
                "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
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
            "modules.frame_update"
          ],
          "cached": [
            "value_sites.refined_pair_features"
          ],
          "notes": [
            "Each layer updates single features and composes a learned rigid increment into the current token frames."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_structure_code",
                "role": "implementation_evidence",
                "locator": "StructureNet.forward and StructureLayer.forward"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "diffusion_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        }
      },
      "denoiser_frames": {
        "representation_ref": "representations.token_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.decoder_frames",
          "value_sites.updated_frames",
          "value_sites.decoder_output_frames"
        ],
        "lifecycle": "derived_then_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; frames are not independently noised.",
          "Within one structure layer, decoder_frames is T_l and updated_frames is T_(l+1); only the eighth layer's write becomes decoder_output_frames, T_hat."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            },
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward"
            }
          ]
        }
      },
      "latent_single_state": {
        "representation_ref": "representations.single_features",
        "value_site_refs": [
          "value_sites.initial_single_features",
          "value_sites.single_with_global_tokens",
          "value_sites.single_after_pair_attention",
          "value_sites.refined_single_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-token state entering one latent block is s_i and that block writes s_(i+1); only the fifth write becomes the globals-removed mature single output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        }
      },
      "latent_pair_state": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
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
          "The bundle carries task-dependent sequence, structure, atomization, chain, and interface masks."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "initial_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "step_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "next_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "final_coordinates": {
        "representation_ref": "representations.token_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.step_coordinates",
          "value_sites.next_coordinates",
          "value_sites.final_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Coordinates are the stochastic state; rotations are deterministically reconstructed from neighboring token coordinates.",
          "A token is one C-alpha for an unatomized residue or one modeled heavy atom for an atomized known residue."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_frames": {
        "representation_ref": "representations.token_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.decoder_frames",
          "value_sites.updated_frames",
          "value_sites.decoder_output_frames"
        ],
        "lifecycle": "derived_then_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; frames are not independently noised.",
          "Within one structure layer, decoder_frames is T_l and updated_frames is T_(l+1); only the eighth layer's write becomes decoder_output_frames, T_hat."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            },
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "decoder_frames": {
        "representation_ref": "representations.token_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.decoder_frames",
          "value_sites.updated_frames",
          "value_sites.decoder_output_frames"
        ],
        "lifecycle": "derived_then_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; frames are not independently noised.",
          "Within one structure layer, decoder_frames is T_l and updated_frames is T_(l+1); only the eighth layer's write becomes decoder_output_frames, T_hat."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            },
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "updated_frames": {
        "representation_ref": "representations.token_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.decoder_frames",
          "value_sites.updated_frames",
          "value_sites.decoder_output_frames"
        ],
        "lifecycle": "derived_then_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; frames are not independently noised.",
          "Within one structure layer, decoder_frames is T_l and updated_frames is T_(l+1); only the eighth layer's write becomes decoder_output_frames, T_hat."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            },
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "decoder_output_frames": {
        "representation_ref": "representations.token_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.decoder_frames",
          "value_sites.updated_frames",
          "value_sites.decoder_output_frames"
        ],
        "lifecycle": "derived_then_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; frames are not independently noised.",
          "Within one structure layer, decoder_frames is T_l and updated_frames is T_(l+1); only the eighth layer's write becomes decoder_output_frames, T_hat."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            },
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "initial_single_features": {
        "representation_ref": "representations.single_features",
        "value_site_refs": [
          "value_sites.initial_single_features",
          "value_sites.single_with_global_tokens",
          "value_sites.single_after_pair_attention",
          "value_sites.refined_single_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-token state entering one latent block is s_i and that block writes s_(i+1); only the fifth write becomes the globals-removed mature single output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        },
        "groupId": "latent_single_state"
      },
      "single_with_global_tokens": {
        "representation_ref": "representations.single_features",
        "value_site_refs": [
          "value_sites.initial_single_features",
          "value_sites.single_with_global_tokens",
          "value_sites.single_after_pair_attention",
          "value_sites.refined_single_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-token state entering one latent block is s_i and that block writes s_(i+1); only the fifth write becomes the globals-removed mature single output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        },
        "groupId": "latent_single_state"
      },
      "single_after_pair_attention": {
        "representation_ref": "representations.single_features",
        "value_site_refs": [
          "value_sites.initial_single_features",
          "value_sites.single_with_global_tokens",
          "value_sites.single_after_pair_attention",
          "value_sites.refined_single_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-token state entering one latent block is s_i and that block writes s_(i+1); only the fifth write becomes the globals-removed mature single output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        },
        "groupId": "latent_single_state"
      },
      "refined_single_features": {
        "representation_ref": "representations.single_features",
        "value_site_refs": [
          "value_sites.initial_single_features",
          "value_sites.single_with_global_tokens",
          "value_sites.single_after_pair_attention",
          "value_sites.refined_single_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-token state entering one latent block is s_i and that block writes s_(i+1); only the fifth write becomes the globals-removed mature single output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward"
            }
          ]
        },
        "groupId": "latent_single_state"
      },
      "initial_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "pair_with_global_tokens": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "pair_after_single_update": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "pair_after_triangle_updates": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "pair_after_transition": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "refined_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_with_global_tokens",
          "value_sites.pair_after_single_update",
          "value_sites.pair_after_triangle_updates",
          "value_sites.pair_after_transition",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "notes": [
          "The global-row/column state entering one latent block is z_i and the pair transition writes z_(i+1); only the fifth write becomes the globals-removed mature pair output."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "groupId": "latent_pair_state"
      },
      "feature_bundle": {
        "representation_ref": "representations.feature_bundle",
        "value_site_refs": [
          "value_sites.feature_bundle"
        ],
        "lifecycle": "read_only_across_sampling",
        "notes": [
          "The bundle carries task-dependent sequence, structure, atomization, chain, and interface masks."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain"
            }
          ]
        },
        "groupId": "conditioning_features"
      }
    },
    "conditioning": [
      {
        "id": "sequence_and_task_conditioning",
        "relation_ref": "relations.feature_bundle_conditions_single_embedder",
        "mode": "masked_sequence_and_task_features",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.single_feature_embedder"
      },
      {
        "id": "conditioned_geometry_injection",
        "relation_ref": "relations.feature_bundle_conditions_pair_embedder",
        "mode": "masked_structure_frames_and_group_geometry",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.pair_feature_embedder"
      },
      {
        "id": "pair_biases_single_attention",
        "relation_ref": "relations.pair_with_global_tokens_bias_attention",
        "mode": "pair_bias_and_value_injection",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_ipa_code",
              "role": "implementation_evidence",
              "locator": "ReducedInvariantPointAttention.forward"
            }
          ]
        },
        "source": "value_sites.pair_with_global_tokens",
        "target": "modules.pair_biased_attention_update"
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        },
        "source": "value_sites.refined_pair_features",
        "target": "modules.invariant_point_attention"
      },
      {
        "id": "frame_conditioned_structure_attention",
        "relation_ref": "relations.decoder_frames_condition_ipa",
        "mode": "invariant_point_geometry",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        },
        "source": "value_sites.decoder_frames",
        "target": "modules.invariant_point_attention"
      }
    ],
    "scaleTransitions": [
      {
        "id": "single_to_pair_expansion",
        "relation_path": [
          "relations.single_after_pair_attention_enters_single_to_pair_update",
          "relations.single_to_pair_update_produces_pair_state"
        ],
        "aggregation": "projected_outer_product",
        "copy_vs_pool": "expand",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        },
        "source": "value_sites.single_after_pair_attention",
        "target": "value_sites.pair_after_single_update",
        "from_scale": "token",
        "to_scale": "pair",
        "projection_refs": [
          "modules.single_to_pair_update"
        ]
      },
      {
        "id": "coordinates_to_pdb_records",
        "relation_path": [
          "relations.final_coordinates_enter_pdb_exporter",
          "relations.pdb_exporter_writes_design_pdb"
        ],
        "aggregation": "serialize_modeled_atom_records",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save and PostProcessor._update_structure"
            }
          ]
        },
        "source": "value_sites.final_coordinates",
        "target": "value_sites.generated_design_pdb",
        "from_scale": "token",
        "to_scale": "output",
        "projection_refs": [
          "modules.pdb_exporter"
        ]
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "coordinate_noise_prediction_with_auxiliary_structure_and_sequence_losses",
        "notes": [
          "Training adds isotropic Gaussian noise to token coordinates and minimizes coordinate-noise error.",
          "The V1 training configuration also supports auxiliary FAPE and sequence losses."
        ]
      },
      "schedule": {
        "kind": "cosine_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddim_directional_scaling",
        "steps": 100,
        "configurable": true,
        "base_schedule_steps": 1000,
        "timestep_selection": "strided_reverse_chain",
        "initial_state": "standard_normal_token_coordinates",
        "guidance": "direction_scale",
        "update": "reconstructed_x0_plus_scaled_direction_and_noise",
        "clip_denoised": false
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "The command-line loader defaults generation to the released V1 checkpoint and the DDIM sampler.",
        "Sequence and sidechain prediction are optional sampler settings and are disabled by default.",
        "Unconditional unknown residues remain C-alpha tokens; atom14 sidechain tokens are introduced for known atomized motif or interface residues."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie3_diffusion_code",
            "role": "implementation_evidence",
            "locator": "DDPM.forward and DDPM.loss"
          },
          {
            "source_ref": "genie3_ddim_code",
            "role": "implementation_evidence",
            "locator": "DDIMSampler._step and DDIMSampler._sample_sequence"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "design_request_enters_feature_builder",
        "from": "value_sites.design_request",
        "to": "modules.task_source_router",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "route_task_source",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            }
          ]
        }
      },
      {
        "id": "feature_builder_produces_feature_bundle",
        "from": "modules.feature_batch_assembler",
        "to": "value_sites.feature_bundle",
        "kind": "data_flow",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "pad_stack_and_prepare_feature_batch",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "batchify_np_features and prepare_tensor_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_sizes_coordinate_initializer",
        "from": "value_sites.feature_bundle",
        "to": "modules.coordinate_initializer",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "size_active_token_tensor",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
          "representations.token_coordinates"
        ],
        "operation": "sample_standard_normal_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
          "representations.token_coordinates"
        ],
        "operation": "initialize_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "current_coordinates_enter_reverse_step",
        "from": "value_sites.current_coordinates",
        "to": "value_sites.step_coordinates",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "read_current_reverse_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "step_coordinates_enter_frame_builder",
        "from": "value_sites.step_coordinates",
        "to": "modules.frenet_frame_builder",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "provide_current_point_cloud",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_frame_builder",
        "from": "value_sites.feature_bundle",
        "to": "modules.frenet_frame_builder",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_frame_neighbor_indices_and_masks",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            }
          ]
        }
      },
      {
        "id": "frame_builder_produces_current_frames",
        "from": "modules.frenet_frame_builder",
        "to": "value_sites.current_frames",
        "kind": "data_flow",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "derive_branched_frenet_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
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
        "operation": "select_reverse_timestep",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_single_embedder",
        "from": "value_sites.feature_bundle",
        "to": "modules.single_feature_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_token_and_task_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "timestep_conditions_single_embedder",
        "from": "value_sites.timestep",
        "to": "modules.single_feature_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.timestep"
        ],
        "operation": "sinusoidal_timestep_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_embedder_produces_initial_single_features",
        "from": "modules.single_feature_embedder",
        "to": "value_sites.initial_single_features",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "concatenate_and_project",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_single_feature_code",
              "role": "implementation_evidence",
              "locator": "V1SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "initial_single_features_enter_pair_embedder",
        "from": "value_sites.initial_single_features",
        "to": "modules.pair_feature_embedder",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "project_outer_sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_pair_embedder",
        "from": "value_sites.current_frames",
        "to": "modules.pair_feature_embedder",
        "kind": "data_flow",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "encode_noisy_frame_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_pair_embedder",
        "from": "value_sites.feature_bundle",
        "to": "modules.pair_feature_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_relative_and_conditioned_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_embedder_produces_initial_pair_features",
        "from": "modules.pair_feature_embedder",
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
              "source_ref": "genie3_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "V1PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "initial_single_features_enter_global_adapter",
        "from": "value_sites.initial_single_features",
        "to": "modules.global_token_adapter",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "append_global_single_tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features_enter_global_adapter",
        "from": "value_sites.initial_pair_features",
        "to": "modules.global_token_adapter",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "append_global_pair_rows_and_columns",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "global_adapter_produces_single_state",
        "from": "modules.global_token_adapter",
        "to": "value_sites.single_with_global_tokens",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "expand_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "global_adapter_produces_pair_state",
        "from": "modules.global_token_adapter",
        "to": "value_sites.pair_with_global_tokens",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "expand_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "single_with_global_tokens_enters_attention",
        "from": "value_sites.single_with_global_tokens",
        "to": "modules.pair_biased_attention_update",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "attend_over_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_with_global_tokens_bias_attention",
        "from": "value_sites.pair_with_global_tokens",
        "to": "modules.pair_biased_attention_update",
        "kind": "conditioning",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "bias_attention_and_inject_pair_values",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_attention_produces_single_state",
        "from": "modules.pair_biased_attention_update",
        "to": "value_sites.single_after_pair_attention",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "residual_single_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_pair_attention_enters_single_to_pair_update",
        "from": "value_sites.single_after_pair_attention",
        "to": "modules.single_to_pair_update",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "projected_outer_product",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_with_global_tokens_enters_single_to_pair_update",
        "from": "value_sites.pair_with_global_tokens",
        "to": "modules.single_to_pair_update",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "receive_residual_pair_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "single_to_pair_update_produces_pair_state",
        "from": "modules.single_to_pair_update",
        "to": "value_sites.pair_after_single_update",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "add_outer_product_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_single_update_enters_triangle_stack",
        "from": "value_sites.pair_after_single_update",
        "to": "modules.triangle_multiplication_stack",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "outgoing_then_incoming_triangle_updates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "triangle_stack_produces_pair_state",
        "from": "modules.triangle_multiplication_stack",
        "to": "value_sites.pair_after_triangle_updates",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_triangle_updates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_triangle_updates_enter_transition",
        "from": "value_sites.pair_after_triangle_updates",
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
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition_produces_block_pair_output",
        "from": "modules.pair_transition",
        "to": "value_sites.pair_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_transition",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "block_single_output_becomes_refined_single_features",
        "from": "value_sites.single_after_pair_attention",
        "to": "value_sites.refined_single_features",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "remove_global_single_tokens_after_final_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "block_pair_output_becomes_refined_pair_features",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.refined_pair_features",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "remove_global_pair_rows_and_columns_after_final_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "block_single_output_reenters_next_latent_block",
        "from": "value_sites.single_after_pair_attention",
        "to": "value_sites.single_with_global_tokens",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "advance_latent_block_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "block_pair_output_reenters_next_latent_block",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.pair_with_global_tokens",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "advance_latent_block_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "refined_single_features_enter_sequence_head",
        "from": "value_sites.refined_single_features",
        "to": "modules.sequence_head",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "classify_residue_identity",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._sample_sequence"
            }
          ]
        }
      },
      {
        "id": "sequence_head_produces_logits",
        "from": "modules.sequence_head",
        "to": "value_sites.sequence_logits",
        "kind": "data_flow",
        "carries": [
          "representations.sequence_logits"
        ],
        "operation": "project_amino_acid_logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._sample_sequence"
            }
          ]
        }
      },
      {
        "id": "refined_single_features_initialize_decoder_state",
        "from": "value_sites.refined_single_features",
        "to": "value_sites.decoder_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "initialize_structure_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_initialize_decoder_frames",
        "from": "value_sites.current_frames",
        "to": "value_sites.decoder_frames",
        "kind": "state_update",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "initialize_structure_frame_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_single_state_enters_ipa",
        "from": "value_sites.decoder_single_state",
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_frames_condition_ipa",
        "from": "value_sites.decoder_frames",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "express_attention_points_in_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
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
        "operation": "mask_invalid_token_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
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
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "transition_state_enters_frame_update",
        "from": "value_sites.single_after_transition",
        "to": "modules.frame_update",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "regress_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "decoder_frames_enter_frame_update",
        "from": "value_sites.decoder_frames",
        "to": "modules.frame_update",
        "kind": "state_update",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "compose_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "frame_update_produces_updated_frames",
        "from": "modules.frame_update",
        "to": "value_sites.updated_frames",
        "kind": "state_update",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "compose_updated_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "transition_state_reenters_decoder",
        "from": "value_sites.single_after_transition",
        "to": "value_sites.decoder_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "continue_structure_layers",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames_reenter_decoder",
        "from": "value_sites.updated_frames",
        "to": "value_sites.decoder_frames",
        "kind": "state_update",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "continue_structure_layers",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames_become_decoder_output_frames",
        "from": "value_sites.updated_frames",
        "to": "value_sites.decoder_output_frames",
        "kind": "state_update",
        "carries": [
          "representations.token_frames"
        ],
        "operation": "expose_final_structure_layer_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames_produce_coordinate_prediction",
        "from": "value_sites.decoder_output_frames",
        "to": "value_sites.coordinate_prediction",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "read_updated_frame_translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "step_coordinates_enter_sampler_math",
        "from": "value_sites.step_coordinates",
        "to": "value_sites.sampler_step_coordinates",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "prepare_fixed_sampler_math_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "sampler_coordinates_enter_noise_readout",
        "from": "value_sites.sampler_step_coordinates",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "retain_noisy_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "coordinate_prediction_enters_noise_readout",
        "from": "value_sites.coordinate_prediction",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "provide_denoised_coordinate_estimate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
        "operation": "subtract_prediction_from_current_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "sampler_coordinates_enter_ddim_update",
        "from": "value_sites.sampler_step_coordinates",
        "to": "modules.ddim_update",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "provide_current_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "predicted_noise_enters_ddim_update",
        "from": "value_sites.predicted_noise",
        "to": "modules.ddim_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "reconstruct_x0_and_direction",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "timestep_enters_ddim_update",
        "from": "value_sites.timestep",
        "to": "modules.ddim_update",
        "kind": "control",
        "carries": [
          "representations.timestep"
        ],
        "operation": "select_schedule_coefficients",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "ddim_update_samples_fresh_noise",
        "from": "modules.ddim_update",
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
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "fresh_noise_reenters_ddim_update",
        "from": "value_sites.fresh_step_noise",
        "to": "modules.ddim_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "add_scaled_step_noise",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "ddim_update_produces_next_coordinates",
        "from": "modules.ddim_update",
        "to": "value_sites.next_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "sample_next_token_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
          "representations.token_coordinates"
        ],
        "operation": "continue_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
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
          "representations.token_coordinates"
        ],
        "operation": "select_terminal_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sampler_code",
              "role": "implementation_evidence",
              "locator": "Sampler._sample"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      },
      {
        "id": "final_coordinates_enter_sequence_sampler",
        "from": "value_sites.final_coordinates",
        "to": "modules.sequence_sampler",
        "kind": "data_flow",
        "carries": [
          "representations.token_coordinates"
        ],
        "operation": "optionally_request_terminal_sequence",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._sample_sequence"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_sequence_sampler",
        "from": "value_sites.feature_bundle",
        "to": "modules.sequence_sampler",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "retain_known_sequence_and_sample_unknown_residues",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._sample_sequence"
            }
          ]
        }
      },
      {
        "id": "sequence_sampler_produces_predicted_sequence",
        "from": "modules.sequence_sampler",
        "to": "value_sites.predicted_sequence",
        "kind": "data_flow",
        "carries": [
          "representations.protein_sequence"
        ],
        "operation": "sample_categorical_sequence",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sequence_code",
              "role": "implementation_evidence",
              "locator": "SequenceNet.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._sample_sequence"
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
          "representations.token_coordinates"
        ],
        "operation": "prepare_modeled_atom_records",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save and PostProcessor._update_structure"
            }
          ]
        }
      },
      {
        "id": "predicted_sequence_enters_pdb_exporter",
        "from": "value_sites.predicted_sequence",
        "to": "modules.pdb_exporter",
        "kind": "conditioning",
        "carries": [
          "representations.protein_sequence"
        ],
        "operation": "optionally_assign_predicted_residue_types",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save and PostProcessor._update_structure"
            }
          ]
        }
      },
      {
        "id": "pdb_exporter_writes_design_pdb",
        "from": "modules.pdb_exporter",
        "to": "value_sites.generated_design_pdb",
        "kind": "data_flow",
        "carries": [
          "representations.protein_pdb"
        ],
        "operation": "serialize_pdb",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_export_code",
              "role": "implementation_evidence",
              "locator": "PostProcessor.save and PostProcessor._update_structure"
            }
          ]
        }
      },
      {
        "id": "task_router_dispatches_unconditional_request",
        "from": "modules.task_source_router",
        "to": "modules.unconditional_featurizer",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "dispatch_when_source_is_unconditional",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            }
          ]
        }
      },
      {
        "id": "task_router_dispatches_motif_request",
        "from": "modules.task_source_router",
        "to": "modules.motif_featurizer",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "dispatch_when_source_is_motif",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            }
          ]
        }
      },
      {
        "id": "task_router_dispatches_target_request",
        "from": "modules.task_source_router",
        "to": "modules.target_featurizer",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "dispatch_when_source_is_target",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_sample_dataset_registry_code",
              "role": "implementation_evidence",
              "locator": "get_sample_dataset"
            }
          ]
        }
      },
      {
        "id": "unconditional_featurizer_produces_sample_features",
        "from": "modules.unconditional_featurizer",
        "to": "modules.feature_batch_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "create_length_conditioned_feature_dictionary",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length"
            }
          ]
        }
      },
      {
        "id": "motif_featurizer_produces_sample_features",
        "from": "modules.motif_featurizer",
        "to": "modules.feature_batch_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "create_motif_conditioned_feature_dictionary",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config"
            }
          ]
        }
      },
      {
        "id": "target_featurizer_produces_sample_features",
        "from": "modules.target_featurizer",
        "to": "modules.feature_batch_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "create_target_conditioned_feature_dictionary",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config"
            }
          ]
        }
      },
      {
        "id": "unconditional_layout_initializes_unknown_features",
        "from": "modules.unconditional_token_layout",
        "to": "modules.unconditional_placeholder_initializer",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "initialize_unknown_values_and_conditioning_masks",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_length"
            }
          ]
        }
      },
      {
        "id": "unconditional_unknown_features_derive_frame_indices",
        "from": "modules.unconditional_placeholder_initializer",
        "to": "modules.unconditional_frame_indices",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "derive_frame_indices_and_masks",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "_update_np_features_on_token_frame_index and _update_np_features_on_token_struct_frame_mask"
            }
          ]
        }
      },
      {
        "id": "motif_parser_defines_scaffold_layout",
        "from": "modules.motif_problem_parser",
        "to": "modules.motif_scaffold_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "select_numeric_scaffold_segments",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config scaffold branch"
            }
          ]
        }
      },
      {
        "id": "motif_parser_selects_conditioned_segments",
        "from": "modules.motif_problem_parser",
        "to": "modules.motif_conditioned_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "select_known_motif_segments",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config motif branch"
            }
          ]
        }
      },
      {
        "id": "motif_scaffold_tokens_enter_assembler",
        "from": "modules.motif_scaffold_tokens",
        "to": "modules.motif_feature_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "provide_unknown_scaffold_segments",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config"
            }
          ]
        }
      },
      {
        "id": "motif_conditioned_tokens_enter_assembler",
        "from": "modules.motif_conditioned_tokens",
        "to": "modules.motif_feature_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "provide_conditioned_motif_segments",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_motif_config"
            }
          ]
        }
      },
      {
        "id": "target_parser_defines_binder_request",
        "from": "modules.target_problem_parser",
        "to": "modules.binder_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "select_binder_length_or_framework",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config binder features"
            }
          ]
        }
      },
      {
        "id": "target_parser_selects_target_interface",
        "from": "modules.target_problem_parser",
        "to": "modules.target_conditioned_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.design_request"
        ],
        "operation": "select_target_chains_and_interface_residues",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config target features"
            }
          ]
        }
      },
      {
        "id": "binder_tokens_enter_target_assembler",
        "from": "modules.binder_tokens",
        "to": "modules.binder_target_feature_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "provide_binder_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config"
            }
          ]
        }
      },
      {
        "id": "target_tokens_enter_target_assembler",
        "from": "modules.target_conditioned_tokens",
        "to": "modules.binder_target_feature_assembler",
        "kind": "data_flow",
        "carries": [
          "representations.sample_feature_dictionary"
        ],
        "operation": "provide_conditioned_target_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_target_config"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "atomization_is_task_dependent",
        "statement": "Genie 3 does not represent every generated residue with atom14 coordinates. Unknown scaffold residues use one C-alpha token, while known motif or interface residues can be expanded into atom14-ordered heavy-atom tokens.",
        "scope": {
          "module_ref": "modules.feature_builder"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_feature_code",
              "role": "implementation_evidence",
              "locator": "create_np_features_from_chain and create_np_features_from_length"
            },
            {
              "source_ref": "genie3_2026",
              "role": "supporting_evidence",
              "locator": "Sections 3.1-3.2 and Figure 1"
            }
          ]
        }
      },
      {
        "id": "frames_are_derived_not_diffused",
        "statement": "The reverse-chain state is a token-coordinate point cloud. Frenet-Serret rotations are rebuilt from that point cloud at each denoiser call and are not an independently noised state.",
        "scope": {
          "module_ref": "modules.frenet_frame_builder"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_model_code",
              "role": "implementation_evidence",
              "locator": "V1Denoiser.forward"
            },
            {
              "source_ref": "genie3_geometry_code",
              "role": "implementation_evidence",
              "locator": "compute_noisy_structure_frames"
            }
          ]
        }
      },
      {
        "id": "latent_communication_is_bidirectional_per_block",
        "statement": "Unlike Genie 2's separated single and pair reasoning, every Genie 3 latent block updates singles from pairs and then pairs from the updated singles before triangular refinement.",
        "scope": {
          "module_ref": "modules.latent_transformer"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "genie3_2026",
              "role": "supporting_evidence",
              "locator": "Section 3.1 and Appendix A.2 Algorithm 1"
            },
            {
              "source_ref": "genie3_latent_transformer_code",
              "role": "implementation_evidence",
              "locator": "LatentTransformerBlock.forward"
            }
          ]
        }
      },
      {
        "id": "sampler_math_is_outside_the_denoiser",
        "statement": "The learned denoiser returns a coordinate estimate; subtraction into predicted noise and the directional DDIM update are fixed sampler operations outside the model.",
        "scope": {
          "module_ref": "modules.reverse_diffusion_step"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie3_model_code",
              "role": "implementation_evidence",
              "locator": "V1Denoiser.forward"
            },
            {
              "source_ref": "genie3_ddim_code",
              "role": "implementation_evidence",
              "locator": "DDIMSampler._step"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "released_sequence_prediction_quality",
        "question": "Which released V1 checkpoints are intended for sequence prediction, and how should that optional output be validated independently of structure generation?",
        "status": "unresolved",
        "affected_refs": [
          "modules.sequence_head",
          "modules.sequence_sampler"
        ],
        "blocking": false,
        "resolution_criteria": "Identify a released evaluation protocol and checkpoint-specific sequence-recovery metrics.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "genie3_ddim_code",
              "role": "question_source",
              "locator": "DDIMSampler._sample_sequence",
              "note": "The sampler exposes sequence prediction as an optional flag, disabled by default."
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
    "pair_biased_attention": {
      "id": "pair_biased_attention",
      "schemaVersion": "standard-block-v0.2",
      "name": "Pair-Biased Attention",
      "sourceYaml": "../../standard_blocks/pair-biased-attention.yaml",
      "description": "Update a single/token stream with self-attention whose logits are conditioned by a pair representation, optionally aggregating pair values and applying an architecture wrapper.",
      "math": [
        {
          "id": "project_qkv",
          "text": "q, k, v = project_qkv(single_state)",
          "tex": "q_i, k_i, v_i = W_{qkv}s_i",
          "operation": "qkv_projection"
        },
        {
          "id": "scalar_logits",
          "text": "scalar_logits = einsum(q, k) * scale",
          "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
          "operation": "attention_logits"
        },
        {
          "id": "project_pair_bias",
          "text": "pair_bias = project_pair(pair_context)",
          "tex": "b_{ijh} = W_h z_{ij}",
          "operation": "pair_bias_projection"
        },
        {
          "id": "combine_logits",
          "text": "biased_logits = scalar_logits + pair_bias",
          "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
          "operation": "pair_bias_add"
        },
        {
          "id": "apply_attention_mask",
          "text": "masked_logits = biased_logits + mask_bias(attention_mask)",
          "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}",
          "operation": "attention_mask"
        },
        {
          "id": "softmax_attention_unmasked",
          "text": "attention = softmax(biased_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell_{ijh})",
          "operation": "softmax"
        },
        {
          "id": "softmax_attention_masked",
          "text": "attention = softmax(masked_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell^m_{ijh})",
          "operation": "softmax"
        },
        {
          "id": "aggregate_scalar_values",
          "text": "scalar_context = einsum(attention, v)",
          "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
          "operation": "weighted_sum"
        },
        {
          "id": "aggregate_pair_values",
          "text": "pair_context_out = einsum(attention, pair_context)",
          "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}",
          "operation": "pair_value_aggregation"
        },
        {
          "id": "project_attention_output",
          "text": "updated_single_state = output_projection(scalar_context)",
          "operation": "output_projection"
        },
        {
          "id": "project_reduced_output",
          "text": "attention_delta = output_projection(concat(scalar_context, pair_context_out))",
          "operation": "output_projection"
        },
        {
          "id": "residual_norm",
          "text": "normalized_single = layer_norm(single_state + dropout(attention_delta))",
          "operation": "residual_normalization"
        },
        {
          "id": "transition_and_mask",
          "text": "updated_single_state = transition(normalized_single) * attention_mask",
          "operation": "transition_mask"
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
          "notation": "s",
          "role": "state used to form queries, keys, and scalar values"
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
          "notation": "z",
          "role": "read-only pair representation used for logit bias and optional pair values"
        },
        {
          "id": "attention_mask",
          "label": "attention mask",
          "direction": "conditioning",
          "kind": "mask",
          "required": false,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "control"
          ],
          "glyph": "vector",
          "notation": "m",
          "role": "optional validity mask applied before softmax and after a reduced wrapper"
        },
        {
          "id": "updated_single_state",
          "label": "updated single state",
          "direction": "output",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "data_flow",
            "state_update"
          ],
          "glyph": "single",
          "notation": "s'",
          "role": "attention-updated single/token stream"
        }
      ],
      "variants": [
        {
          "id": "logit_bias_only",
          "label": "Pair-logit bias",
          "description": "Standard self-attention with a projected pair term added to logits; pair features are not aggregated as values.",
          "step_refs": [
            "steps.project_qkv",
            "steps.scalar_logits",
            "steps.project_pair_bias",
            "steps.combine_logits",
            "steps.softmax_attention_unmasked",
            "steps.aggregate_scalar_values",
            "steps.project_attention_output"
          ]
        },
        {
          "id": "pair_values_residual_norm_transition",
          "label": "Reduced pair attention + wrapper",
          "description": "A reduced IPA-style path adds pair bias, aggregates pair values, then applies residual normalization, a transition, and output masking.",
          "step_refs": [
            "steps.project_qkv",
            "steps.scalar_logits",
            "steps.project_pair_bias",
            "steps.combine_logits",
            "steps.apply_attention_mask",
            "steps.softmax_attention_masked",
            "steps.aggregate_scalar_values",
            "steps.aggregate_pair_values",
            "steps.project_reduced_output",
            "steps.residual_norm",
            "steps.transition_and_mask"
          ]
        }
      ],
      "defaultVariant": "logit_bias_only",
      "values": [
        {
          "id": "queries",
          "label": "queries",
          "kind": "representation",
          "glyph": "single",
          "notation": "Q"
        },
        {
          "id": "keys",
          "label": "keys",
          "kind": "representation",
          "glyph": "single",
          "notation": "K"
        },
        {
          "id": "scalar_values",
          "label": "scalar values",
          "kind": "representation",
          "glyph": "single",
          "notation": "V"
        },
        {
          "id": "scalar_logits",
          "label": "query-key logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_qk"
        },
        {
          "id": "pair_bias",
          "label": "projected pair bias",
          "kind": "logit",
          "glyph": "pair",
          "notation": "b_z"
        },
        {
          "id": "biased_logits",
          "label": "conditioned logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l"
        },
        {
          "id": "masked_logits",
          "label": "masked logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_m"
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
          "id": "pair_value_context",
          "label": "pair-value context",
          "kind": "representation",
          "glyph": "single",
          "notation": "o_z"
        },
        {
          "id": "attention_delta",
          "label": "attention delta",
          "kind": "representation",
          "glyph": "single",
          "notation": "delta_s"
        },
        {
          "id": "normalized_single",
          "label": "residual-normalized state",
          "kind": "representation",
          "glyph": "single",
          "notation": "s_norm"
        }
      ],
      "steps": [
        {
          "id": "project_qkv",
          "label": "Project Q, K, and V",
          "operation": "qkv_projection",
          "inputs": [
            "ports.single_state"
          ],
          "outputs": [
            "values.queries",
            "values.keys",
            "values.scalar_values"
          ],
          "code": "q, k, v = project_qkv(single_state)",
          "tex": "q_i, k_i, v_i = W_{qkv}s_i",
          "role": "form self-attention terms from the same single-state input"
        },
        {
          "id": "scalar_logits",
          "label": "Form query-key logits",
          "operation": "attention_logits",
          "inputs": [
            "values.queries",
            "values.keys"
          ],
          "outputs": [
            "values.scalar_logits"
          ],
          "code": "scalar_logits = einsum(q, k) * scale",
          "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h"
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
          "code": "pair_bias = project_pair(pair_context)",
          "tex": "b_{ijh} = W_h z_{ij}",
          "role": "the selected architecture variant owns any pair preprocessing before projection"
        },
        {
          "id": "combine_logits",
          "label": "Add pair bias",
          "operation": "pair_bias_add",
          "inputs": [
            "values.scalar_logits",
            "values.pair_bias"
          ],
          "outputs": [
            "values.biased_logits"
          ],
          "code": "biased_logits = scalar_logits + pair_bias",
          "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}"
        },
        {
          "id": "apply_attention_mask",
          "label": "Apply attention mask",
          "operation": "attention_mask",
          "inputs": [
            "values.biased_logits",
            "ports.attention_mask"
          ],
          "outputs": [
            "values.masked_logits"
          ],
          "code": "masked_logits = biased_logits + mask_bias(attention_mask)",
          "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}"
        },
        {
          "id": "softmax_attention_unmasked",
          "label": "Normalize attention",
          "operation": "softmax",
          "inputs": [
            "values.biased_logits"
          ],
          "outputs": [
            "values.attention_weights"
          ],
          "code": "attention = softmax(biased_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell_{ijh})"
        },
        {
          "id": "softmax_attention_masked",
          "label": "Normalize masked attention",
          "operation": "softmax",
          "inputs": [
            "values.masked_logits"
          ],
          "outputs": [
            "values.attention_weights"
          ],
          "code": "attention = softmax(masked_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell^m_{ijh})"
        },
        {
          "id": "aggregate_scalar_values",
          "label": "Aggregate scalar values",
          "operation": "weighted_sum",
          "inputs": [
            "values.attention_weights",
            "values.scalar_values"
          ],
          "outputs": [
            "values.scalar_context"
          ],
          "code": "scalar_context = einsum(attention, v)",
          "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}"
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
          "code": "pair_context_out = einsum(attention, pair_context)",
          "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}"
        },
        {
          "id": "project_attention_output",
          "label": "Project attention output",
          "operation": "output_projection",
          "inputs": [
            "values.scalar_context"
          ],
          "outputs": [
            "ports.updated_single_state"
          ],
          "code": "updated_single_state = output_projection(scalar_context)"
        },
        {
          "id": "project_reduced_output",
          "label": "Fuse scalar and pair contexts",
          "operation": "output_projection",
          "inputs": [
            "values.scalar_context",
            "values.pair_value_context"
          ],
          "outputs": [
            "values.attention_delta"
          ],
          "code": "attention_delta = output_projection(concat(scalar_context, pair_context_out))"
        },
        {
          "id": "residual_norm",
          "label": "Residual, dropout, and norm",
          "operation": "residual_normalization",
          "inputs": [
            "ports.single_state",
            "values.attention_delta"
          ],
          "outputs": [
            "values.normalized_single"
          ],
          "code": "normalized_single = layer_norm(single_state + dropout(attention_delta))"
        },
        {
          "id": "transition_and_mask",
          "label": "Transition and mask",
          "operation": "transition_mask",
          "inputs": [
            "values.normalized_single",
            "ports.attention_mask"
          ],
          "outputs": [
            "ports.updated_single_state"
          ],
          "code": "updated_single_state = transition(normalized_single) * attention_mask"
        }
      ],
      "visualTemplate": {
        "grid": {
          "columns": 9,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 28,
          "row_gap": 24
        },
        "nodes": [
          {
            "id": "single_state",
            "ref": "ports.single_state",
            "col": 1,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "pair_context",
            "ref": "ports.pair_context",
            "col": 1,
            "row": 5,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "attention_mask",
            "ref": "ports.attention_mask",
            "col": 3,
            "row": 6,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "updated_single_state",
            "ref": "ports.updated_single_state",
            "col": 9,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "project_qkv",
            "ref": "steps.project_qkv",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "queries",
            "ref": "values.queries",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "keys",
            "ref": "values.keys",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "scalar_values",
            "ref": "values.scalar_values",
            "col": 3,
            "row": 3,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "scalar_logits_step",
            "ref": "steps.scalar_logits",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_logits",
            "ref": "values.scalar_logits",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_pair_bias",
            "ref": "steps.project_pair_bias",
            "col": 3,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_bias",
            "ref": "values.pair_bias",
            "col": 5,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "combine_logits",
            "ref": "steps.combine_logits",
            "col": 6,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "biased_logits",
            "ref": "values.biased_logits",
            "col": 7,
            "row": 3,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "apply_attention_mask",
            "ref": "steps.apply_attention_mask",
            "col": 5,
            "row": 6,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "masked_logits",
            "ref": "values.masked_logits",
            "col": 7,
            "row": 6,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "softmax_attention_unmasked",
            "ref": "steps.softmax_attention_unmasked",
            "col": 8,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "softmax_attention_masked",
            "ref": "steps.softmax_attention_masked",
            "col": 8,
            "row": 6,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "attention_weights",
            "ref": "values.attention_weights",
            "col": 9,
            "row": 3,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_scalar_values",
            "ref": "steps.aggregate_scalar_values",
            "col": 6,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_context",
            "ref": "values.scalar_context",
            "col": 7,
            "row": 1,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_pair_values",
            "ref": "steps.aggregate_pair_values",
            "col": 6,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_value_context",
            "ref": "values.pair_value_context",
            "col": 7,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_attention_output",
            "ref": "steps.project_attention_output",
            "col": 8,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "project_reduced_output",
            "ref": "steps.project_reduced_output",
            "col": 8,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "attention_delta",
            "ref": "values.attention_delta",
            "col": 9,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "residual_norm",
            "ref": "steps.residual_norm",
            "col": 7,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "normalized_single",
            "ref": "values.normalized_single",
            "col": 8,
            "row": 4,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "transition_and_mask",
            "ref": "steps.transition_and_mask",
            "col": 9,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact"
          }
        ]
      },
      "evidencePolicy": {
        "generic_definition": "The template is reusable algorithm vocabulary, not evidence that a method uses every variant.",
        "usage_requires": [
          "Evidence for the pair projection and addition to attention logits.",
          "Evidence for pair-value aggregation and wrapper operations when the reduced variant is selected."
        ]
      }
    },
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
    "genie3": {
      "schemaVersion": "pseudocode-v0.2",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "genie3",
      "title": "Genie 3 Sampling and Denoiser Trace",
      "rootScope": "scopes.inference",
      "sources": [
        {
          "id": "sampler_code",
          "source_ref": "genie3_sampler_code"
        },
        {
          "id": "ddim_code",
          "source_ref": "genie3_ddim_code"
        },
        {
          "id": "model_code",
          "source_ref": "genie3_model_code"
        },
        {
          "id": "feature_code",
          "source_ref": "genie3_feature_code"
        },
        {
          "id": "geometry_code",
          "source_ref": "genie3_geometry_code"
        },
        {
          "id": "latent_code",
          "source_ref": "genie3_latent_transformer_code"
        },
        {
          "id": "structure_code",
          "source_ref": "genie3_structure_code"
        },
        {
          "id": "export_code",
          "source_ref": "genie3_export_code"
        }
      ],
      "scopes": [
        {
          "id": "inference",
          "ref": "scopes.inference",
          "label": "Genie 3 inference",
          "kind": "program",
          "parentRef": "pseudocode",
          "subjectRef": "architecture"
        },
        {
          "id": "sampling",
          "ref": "scopes.sampling",
          "label": "Directional DDIM sampling",
          "kind": "loop",
          "parentRef": "scopes.inference",
          "subjectRef": "modules.diffusion_sampler",
          "executionRef": "execution.loops.reverse_diffusion_loop"
        },
        {
          "id": "reverse_step",
          "ref": "scopes.reverse_step",
          "label": "One reverse-diffusion step",
          "kind": "module",
          "parentRef": "scopes.sampling",
          "subjectRef": "modules.reverse_diffusion_step"
        },
        {
          "id": "denoiser",
          "ref": "scopes.denoiser",
          "label": "Coordinate denoiser",
          "kind": "module",
          "parentRef": "scopes.reverse_step",
          "subjectRef": "modules.denoiser"
        },
        {
          "id": "sampler_math",
          "ref": "scopes.sampler_math",
          "label": "Fixed directional DDIM math",
          "kind": "module",
          "parentRef": "scopes.reverse_step",
          "subjectRef": "modules.directional_ddim_sampler_math"
        }
      ],
      "symbols": [
        {
          "id": "design_request",
          "name": "request",
          "type": "input",
          "shape": "B x request metadata",
          "representationRef": "representations.design_request",
          "scale": "sample",
          "scopeRef": "scopes.inference",
          "architectureRef": "value_sites.design_request"
        },
        {
          "id": "feature_bundle",
          "name": "features",
          "type": "input",
          "shape": "B x N token fields + B x A atom fields",
          "representationRef": "representations.feature_bundle",
          "scale": "mixed",
          "glyph": "dictionary",
          "scopeRef": "scopes.inference",
          "architectureRef": "value_sites.feature_bundle"
        },
        {
          "id": "current_coordinates",
          "name": "x_t",
          "tex": "x_t",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.sampling",
          "architectureRef": "value_sites.current_coordinates"
        },
        {
          "id": "step_coordinates",
          "name": "x_step",
          "tex": "x_t",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.step_coordinates"
        },
        {
          "id": "sampler_step_coordinates",
          "name": "x_sampler",
          "tex": "x_t",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.sampler_step_coordinates"
        },
        {
          "id": "final_coordinates",
          "name": "x_0",
          "tex": "x_0",
          "type": "output",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.inference",
          "architectureRef": "value_sites.final_coordinates"
        },
        {
          "id": "generated_design_pdb",
          "name": "design_pdb",
          "type": "output",
          "shape": "modeled atom records",
          "representationRef": "representations.protein_pdb",
          "scale": "output",
          "scopeRef": "scopes.inference",
          "architectureRef": "value_sites.generated_design_pdb"
        },
        {
          "id": "initial_coordinates",
          "name": "x_T",
          "tex": "x_T",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.sampling",
          "architectureRef": "value_sites.initial_coordinates"
        },
        {
          "id": "current_frames",
          "name": "T_t",
          "tex": "T_t",
          "type": "representation",
          "shape": "B x N x (3 x 3 + 3)",
          "representationRef": "representations.token_frames",
          "scale": "token",
          "glyph": "frames",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.current_frames"
        },
        {
          "id": "timestep",
          "name": "t",
          "type": "control",
          "shape": "B",
          "representationRef": "representations.timestep",
          "scale": "sample",
          "scopeRef": "scopes.sampling",
          "architectureRef": "value_sites.timestep"
        },
        {
          "id": "initial_single_features",
          "name": "s_0",
          "tex": "s_0",
          "type": "representation",
          "shape": "B x N x 384",
          "representationRef": "representations.single_features",
          "scale": "token",
          "scopeRef": "scopes.denoiser",
          "architectureRef": "value_sites.initial_single_features"
        },
        {
          "id": "initial_pair_features",
          "name": "z_0",
          "tex": "z_0",
          "type": "representation",
          "shape": "B x N x N x 128",
          "representationRef": "representations.pair_features",
          "scale": "pair",
          "scopeRef": "scopes.denoiser",
          "architectureRef": "value_sites.initial_pair_features"
        },
        {
          "id": "refined_single_features",
          "name": "s_5",
          "tex": "s_5",
          "type": "representation",
          "shape": "B x N x 384",
          "representationRef": "representations.single_features",
          "scale": "token",
          "scopeRef": "scopes.denoiser",
          "architectureRef": "value_sites.refined_single_features"
        },
        {
          "id": "refined_pair_features",
          "name": "z_5",
          "tex": "z_5",
          "type": "representation",
          "shape": "B x N x N x 128",
          "representationRef": "representations.pair_features",
          "scale": "pair",
          "scopeRef": "scopes.denoiser",
          "architectureRef": "value_sites.refined_pair_features"
        },
        {
          "id": "coordinate_prediction",
          "name": "x_hat",
          "tex": "\\hat{x}_0",
          "type": "output",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.coordinate_prediction"
        },
        {
          "id": "predicted_noise",
          "name": "epsilon_theta",
          "tex": "\\epsilon_\\theta",
          "type": "output",
          "shape": "B x N x 3",
          "representationRef": "representations.coordinate_noise",
          "scale": "token",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.predicted_noise"
        },
        {
          "id": "next_coordinates",
          "name": "x_next",
          "tex": "x_{t-10}",
          "type": "state",
          "shape": "B x N x 3",
          "representationRef": "representations.token_coordinates",
          "scale": "token",
          "glyph": "coordinates",
          "scopeRef": "scopes.sampling",
          "architectureRef": "value_sites.next_coordinates"
        },
        {
          "id": "sequence_logits",
          "name": "sequence_logits",
          "tex": "\\ell_{aa}",
          "type": "output",
          "shape": "B x N x 20",
          "representationRef": "representations.sequence_logits",
          "scale": "token",
          "scopeRef": "scopes.reverse_step",
          "architectureRef": "value_sites.sequence_logits"
        }
      ],
      "lines": [
        {
          "id": "prepare_tokens",
          "text": "features = tokenize(request)",
          "comment": "C-alpha per unknown residue; atom14 heavy atoms only for known atomized residues.",
          "refs": "create_np_features_from_chain and create_np_features_from_length",
          "sourceRefs": [
            {
              "source": "feature_code",
              "locator": "create_np_features_from_chain and create_np_features_from_length"
            }
          ],
          "scopeRef": "scopes.inference",
          "statementRef": "modules.feature_builder",
          "architectureRefs": [
            "modules.feature_builder",
            "claims.atomization_is_task_dependent"
          ],
          "operation": "task_dependent_partial_atomization",
          "inputs": [
            "design_request"
          ],
          "outputs": [
            "feature_bundle"
          ],
          "codeBindings": [
            {
              "lexeme": "features",
              "access": "write",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 0,
                  "end": 8
                }
              ]
            },
            {
              "lexeme": "tokenize",
              "access": "call",
              "architectureRef": "modules.feature_builder",
              "occurrences": [
                {
                  "start": 11,
                  "end": 19
                }
              ]
            },
            {
              "lexeme": "request",
              "access": "read",
              "symbolId": "design_request",
              "architectureRef": "value_sites.design_request",
              "occurrences": [
                {
                  "start": 20,
                  "end": 27
                }
              ]
            }
          ]
        },
        {
          "id": "run_diffusion_sampler",
          "text": "x_0 = DiffusionSampler(features)",
          "refs": "Sampler.sample and Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler.sample and Sampler._sample"
            }
          ],
          "scopeRef": "scopes.inference",
          "statementRef": "modules.diffusion_sampler",
          "calleeScopeRef": "scopes.sampling",
          "architectureRefs": [
            "modules.diffusion_sampler"
          ],
          "operation": "directional_ddim_sampling",
          "inputs": [
            "feature_bundle"
          ],
          "outputs": [
            "final_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_0",
              "access": "write",
              "symbolId": "final_coordinates",
              "tex": "x_0",
              "architectureRef": "value_sites.final_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "DiffusionSampler",
              "access": "call",
              "architectureRef": "modules.diffusion_sampler",
              "occurrences": [
                {
                  "start": 6,
                  "end": 22
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 23,
                  "end": 31
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_coordinates",
          "text": "x_T = randn_like(features.gt_atom_positions)",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "modules.coordinate_initializer",
          "architectureRefs": [
            "modules.coordinate_initializer"
          ],
          "operation": "gaussian_coordinate_initialization",
          "inputs": [
            "feature_bundle"
          ],
          "outputs": [
            "initial_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_T",
              "access": "write",
              "symbolId": "initial_coordinates",
              "tex": "x_T",
              "architectureRef": "value_sites.initial_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "randn_like",
              "access": "call",
              "architectureRef": "modules.coordinate_initializer",
              "occurrences": [
                {
                  "start": 6,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 17,
                  "end": 25
                }
              ]
            }
          ]
        },
        {
          "id": "begin_sampling_state",
          "text": "x_t = x_T",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "relations.initial_coordinates_begin_sampling_state",
          "architectureRefs": [
            "relations.initial_coordinates_begin_sampling_state"
          ],
          "operation": "initialize_sampling_state",
          "inputs": [
            "initial_coordinates"
          ],
          "outputs": [
            "current_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_t",
              "access": "write",
              "symbolId": "current_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.current_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "x_T",
              "access": "read",
              "symbolId": "initial_coordinates",
              "tex": "x_T",
              "architectureRef": "value_sites.initial_coordinates",
              "occurrences": [
                {
                  "start": 6,
                  "end": 9
                }
              ]
            }
          ]
        },
        {
          "id": "select_timestep",
          "text": "t = SelectTimestep()",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "modules.timestep_controller",
          "architectureRefs": [
            "modules.timestep_controller",
            "execution.loops.reverse_diffusion_loop"
          ],
          "operation": "select_sampling_timestep",
          "inputs": [

          ],
          "outputs": [
            "timestep"
          ],
          "codeBindings": [
            {
              "lexeme": "t",
              "access": "write",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 0,
                  "end": 1
                }
              ]
            },
            {
              "lexeme": "SelectTimestep",
              "access": "call",
              "architectureRef": "modules.timestep_controller",
              "occurrences": [
                {
                  "start": 4,
                  "end": 18
                }
              ]
            }
          ]
        },
        {
          "id": "run_reverse_step",
          "text": "x_next = ReverseDiffusionStep(x_t, features, t)",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "modules.reverse_diffusion_step",
          "calleeScopeRef": "scopes.reverse_step",
          "architectureRefs": [
            "modules.reverse_diffusion_step",
            "execution.loops.reverse_diffusion_loop"
          ],
          "operation": "reverse_diffusion_step",
          "inputs": [
            "current_coordinates",
            "feature_bundle",
            "timestep"
          ],
          "outputs": [
            "next_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_next",
              "access": "write",
              "symbolId": "next_coordinates",
              "tex": "x_{t-10}",
              "architectureRef": "value_sites.next_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "ReverseDiffusionStep",
              "access": "call",
              "architectureRef": "modules.reverse_diffusion_step",
              "occurrences": [
                {
                  "start": 9,
                  "end": 29
                }
              ]
            },
            {
              "lexeme": "x_t",
              "access": "read",
              "symbolId": "current_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.current_coordinates",
              "occurrences": [
                {
                  "start": 30,
                  "end": 33
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 35,
                  "end": 43
                }
              ]
            },
            {
              "lexeme": "t",
              "access": "read",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 45,
                  "end": 46
                }
              ]
            }
          ]
        },
        {
          "id": "enter_reverse_step",
          "text": "x_step = x_t",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.reverse_step",
          "statementRef": "relations.current_coordinates_enter_reverse_step",
          "architectureRefs": [
            "relations.current_coordinates_enter_reverse_step"
          ],
          "operation": "read_current_reverse_state",
          "inputs": [
            "current_coordinates"
          ],
          "outputs": [
            "step_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_step",
              "access": "write",
              "symbolId": "step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.step_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "x_t",
              "access": "read",
              "symbolId": "current_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.current_coordinates",
              "occurrences": [
                {
                  "start": 9,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "derive_frames",
          "text": "T_t = FrenetFrames(x_step, features.left_center_right_indices)",
          "refs": "compute_noisy_structure_frames",
          "sourceRefs": [
            {
              "source": "geometry_code",
              "locator": "compute_noisy_structure_frames"
            }
          ],
          "scopeRef": "scopes.reverse_step",
          "statementRef": "modules.frenet_frame_builder",
          "architectureRefs": [
            "modules.frenet_frame_builder",
            "claims.frames_are_derived_not_diffused"
          ],
          "operation": "derive_branched_frenet_frames",
          "inputs": [
            "step_coordinates",
            "feature_bundle"
          ],
          "outputs": [
            "current_frames"
          ],
          "codeBindings": [
            {
              "lexeme": "T_t",
              "access": "write",
              "symbolId": "current_frames",
              "tex": "T_t",
              "architectureRef": "value_sites.current_frames",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "FrenetFrames",
              "access": "call",
              "architectureRef": "modules.frenet_frame_builder",
              "occurrences": [
                {
                  "start": 6,
                  "end": 18
                }
              ]
            },
            {
              "lexeme": "x_step",
              "access": "read",
              "symbolId": "step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.step_coordinates",
              "occurrences": [
                {
                  "start": 19,
                  "end": 25
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 27,
                  "end": 35
                }
              ]
            }
          ]
        },
        {
          "id": "run_denoiser",
          "text": "x_hat, sequence_logits = Denoiser(T_t, features, t)",
          "refs": "V1Denoiser.forward",
          "sourceRefs": [
            {
              "source": "model_code",
              "locator": "V1Denoiser.forward"
            }
          ],
          "scopeRef": "scopes.reverse_step",
          "statementRef": "modules.denoiser",
          "calleeScopeRef": "scopes.denoiser",
          "architectureRefs": [
            "modules.denoiser"
          ],
          "operation": "coordinate_denoising",
          "inputs": [
            "current_frames",
            "feature_bundle",
            "timestep"
          ],
          "outputs": [
            "coordinate_prediction",
            "sequence_logits"
          ],
          "codeBindings": [
            {
              "lexeme": "x_hat",
              "access": "write",
              "symbolId": "coordinate_prediction",
              "tex": "\\hat{x}_0",
              "architectureRef": "value_sites.coordinate_prediction",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "sequence_logits",
              "access": "write",
              "symbolId": "sequence_logits",
              "tex": "\\ell_{aa}",
              "architectureRef": "value_sites.sequence_logits",
              "occurrences": [
                {
                  "start": 7,
                  "end": 22
                }
              ]
            },
            {
              "lexeme": "Denoiser",
              "access": "call",
              "architectureRef": "modules.denoiser",
              "occurrences": [
                {
                  "start": 25,
                  "end": 33
                }
              ]
            },
            {
              "lexeme": "T_t",
              "access": "read",
              "symbolId": "current_frames",
              "tex": "T_t",
              "architectureRef": "value_sites.current_frames",
              "occurrences": [
                {
                  "start": 34,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 39,
                  "end": 47
                }
              ]
            },
            {
              "lexeme": "t",
              "access": "read",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 49,
                  "end": 50
                }
              ]
            }
          ]
        },
        {
          "id": "embed_single",
          "text": "s_0 = SingleFeatureEmbedder(features, t)",
          "refs": "V1Denoiser.forward",
          "sourceRefs": [
            {
              "source": "model_code",
              "locator": "V1Denoiser.forward"
            }
          ],
          "scopeRef": "scopes.denoiser",
          "statementRef": "modules.single_feature_embedder",
          "architectureRefs": [
            "modules.single_feature_embedder"
          ],
          "operation": "single_feature_embedding",
          "inputs": [
            "feature_bundle",
            "timestep"
          ],
          "outputs": [
            "initial_single_features"
          ],
          "codeBindings": [
            {
              "lexeme": "s_0",
              "access": "write",
              "symbolId": "initial_single_features",
              "tex": "s_0",
              "architectureRef": "value_sites.initial_single_features",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "SingleFeatureEmbedder",
              "access": "call",
              "architectureRef": "modules.single_feature_embedder",
              "occurrences": [
                {
                  "start": 6,
                  "end": 27
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 28,
                  "end": 36
                }
              ]
            },
            {
              "lexeme": "t",
              "access": "read",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 38,
                  "end": 39
                }
              ]
            }
          ]
        },
        {
          "id": "embed_pair",
          "text": "z_0 = PairFeatureEmbedder(features, T_t, s_0)",
          "refs": "V1Denoiser.forward",
          "sourceRefs": [
            {
              "source": "model_code",
              "locator": "V1Denoiser.forward"
            }
          ],
          "scopeRef": "scopes.denoiser",
          "statementRef": "modules.pair_feature_embedder",
          "architectureRefs": [
            "modules.pair_feature_embedder"
          ],
          "operation": "pair_feature_embedding",
          "inputs": [
            "feature_bundle",
            "current_frames",
            "initial_single_features"
          ],
          "outputs": [
            "initial_pair_features"
          ],
          "codeBindings": [
            {
              "lexeme": "z_0",
              "access": "write",
              "symbolId": "initial_pair_features",
              "tex": "z_0",
              "architectureRef": "value_sites.initial_pair_features",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "PairFeatureEmbedder",
              "access": "call",
              "architectureRef": "modules.pair_feature_embedder",
              "occurrences": [
                {
                  "start": 6,
                  "end": 25
                }
              ]
            },
            {
              "lexeme": "features",
              "access": "read",
              "symbolId": "feature_bundle",
              "architectureRef": "value_sites.feature_bundle",
              "occurrences": [
                {
                  "start": 26,
                  "end": 34
                }
              ]
            },
            {
              "lexeme": "T_t",
              "access": "read",
              "symbolId": "current_frames",
              "tex": "T_t",
              "architectureRef": "value_sites.current_frames",
              "occurrences": [
                {
                  "start": 36,
                  "end": 39
                }
              ]
            },
            {
              "lexeme": "s_0",
              "access": "read",
              "symbolId": "initial_single_features",
              "tex": "s_0",
              "architectureRef": "value_sites.initial_single_features",
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
          "id": "latent_transform",
          "text": "s_5, z_5 = LatentTransformer(s_0, z_0)",
          "refs": "LatentTransformer.forward and LatentTransformerBlock.forward",
          "sourceRefs": [
            {
              "source": "latent_code",
              "locator": "LatentTransformer.forward and LatentTransformerBlock.forward"
            }
          ],
          "scopeRef": "scopes.denoiser",
          "statementRef": "modules.latent_transformer",
          "architectureRefs": [
            "modules.latent_transformer",
            "claims.latent_communication_is_bidirectional_per_block"
          ],
          "operation": "bidirectional_single_pair_refinement",
          "inputs": [
            "initial_single_features",
            "initial_pair_features"
          ],
          "outputs": [
            "refined_single_features",
            "refined_pair_features"
          ],
          "codeBindings": [
            {
              "lexeme": "s_5",
              "access": "write",
              "symbolId": "refined_single_features",
              "tex": "s_5",
              "architectureRef": "value_sites.refined_single_features",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "z_5",
              "access": "write",
              "symbolId": "refined_pair_features",
              "tex": "z_5",
              "architectureRef": "value_sites.refined_pair_features",
              "occurrences": [
                {
                  "start": 5,
                  "end": 8
                }
              ]
            },
            {
              "lexeme": "LatentTransformer",
              "access": "call",
              "architectureRef": "modules.latent_transformer",
              "occurrences": [
                {
                  "start": 11,
                  "end": 28
                }
              ]
            },
            {
              "lexeme": "s_0",
              "access": "read",
              "symbolId": "initial_single_features",
              "tex": "s_0",
              "architectureRef": "value_sites.initial_single_features",
              "occurrences": [
                {
                  "start": 29,
                  "end": 32
                }
              ]
            },
            {
              "lexeme": "z_0",
              "access": "read",
              "symbolId": "initial_pair_features",
              "tex": "z_0",
              "architectureRef": "value_sites.initial_pair_features",
              "occurrences": [
                {
                  "start": 34,
                  "end": 37
                }
              ]
            }
          ]
        },
        {
          "id": "decode_structure",
          "text": "x_hat = StructureDecoder(s_5, z_5, T_t)",
          "refs": "StructureNet.forward and StructureLayer.forward",
          "sourceRefs": [
            {
              "source": "structure_code",
              "locator": "StructureNet.forward and StructureLayer.forward"
            }
          ],
          "scopeRef": "scopes.denoiser",
          "statementRef": "modules.structure_decoder",
          "architectureRefs": [
            "modules.structure_decoder"
          ],
          "operation": "equivariant_structure_refinement",
          "inputs": [
            "refined_single_features",
            "refined_pair_features",
            "current_frames"
          ],
          "outputs": [
            "coordinate_prediction"
          ],
          "codeBindings": [
            {
              "lexeme": "x_hat",
              "access": "write",
              "symbolId": "coordinate_prediction",
              "tex": "\\hat{x}_0",
              "architectureRef": "value_sites.coordinate_prediction",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "StructureDecoder",
              "access": "call",
              "architectureRef": "modules.structure_decoder",
              "occurrences": [
                {
                  "start": 8,
                  "end": 24
                }
              ]
            },
            {
              "lexeme": "s_5",
              "access": "read",
              "symbolId": "refined_single_features",
              "tex": "s_5",
              "architectureRef": "value_sites.refined_single_features",
              "occurrences": [
                {
                  "start": 25,
                  "end": 28
                }
              ]
            },
            {
              "lexeme": "z_5",
              "access": "read",
              "symbolId": "refined_pair_features",
              "tex": "z_5",
              "architectureRef": "value_sites.refined_pair_features",
              "occurrences": [
                {
                  "start": 30,
                  "end": 33
                }
              ]
            },
            {
              "lexeme": "T_t",
              "access": "read",
              "symbolId": "current_frames",
              "tex": "T_t",
              "architectureRef": "value_sites.current_frames",
              "occurrences": [
                {
                  "start": 35,
                  "end": 38
                }
              ]
            }
          ]
        },
        {
          "id": "predict_sequence",
          "text": "sequence_logits = SequenceHead(s_5)",
          "comment": "Sampled only when predict_sequence is enabled.",
          "refs": "V1Denoiser.forward, DDIMSampler._sample_sequence",
          "sourceRefs": [
            {
              "source": "model_code",
              "locator": "V1Denoiser.forward"
            },
            {
              "source": "ddim_code",
              "locator": "DDIMSampler._sample_sequence"
            }
          ],
          "scopeRef": "scopes.denoiser",
          "statementRef": "modules.sequence_head",
          "architectureRefs": [
            "modules.sequence_head"
          ],
          "operation": "optional_sequence_prediction",
          "inputs": [
            "refined_single_features"
          ],
          "outputs": [
            "sequence_logits"
          ],
          "codeBindings": [
            {
              "lexeme": "sequence_logits",
              "access": "write",
              "symbolId": "sequence_logits",
              "tex": "\\ell_{aa}",
              "architectureRef": "value_sites.sequence_logits",
              "occurrences": [
                {
                  "start": 0,
                  "end": 15
                }
              ]
            },
            {
              "lexeme": "SequenceHead",
              "access": "call",
              "architectureRef": "modules.sequence_head",
              "occurrences": [
                {
                  "start": 18,
                  "end": 30
                }
              ]
            },
            {
              "lexeme": "s_5",
              "access": "read",
              "symbolId": "refined_single_features",
              "tex": "s_5",
              "architectureRef": "value_sites.refined_single_features",
              "occurrences": [
                {
                  "start": 31,
                  "end": 34
                }
              ]
            }
          ]
        },
        {
          "id": "run_sampler_math",
          "text": "x_next = DirectionalDDIMMath(x_step, x_hat, t)",
          "refs": "DDIMSampler._step",
          "sourceRefs": [
            {
              "source": "ddim_code",
              "locator": "DDIMSampler._step"
            }
          ],
          "scopeRef": "scopes.reverse_step",
          "statementRef": "modules.directional_ddim_sampler_math",
          "calleeScopeRef": "scopes.sampler_math",
          "architectureRefs": [
            "modules.directional_ddim_sampler_math"
          ],
          "operation": "fixed_directional_ddim_math",
          "inputs": [
            "step_coordinates",
            "coordinate_prediction",
            "timestep"
          ],
          "outputs": [
            "next_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_next",
              "access": "write",
              "symbolId": "next_coordinates",
              "tex": "x_{t-10}",
              "architectureRef": "value_sites.next_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "DirectionalDDIMMath",
              "access": "call",
              "architectureRef": "modules.directional_ddim_sampler_math",
              "occurrences": [
                {
                  "start": 9,
                  "end": 28
                }
              ]
            },
            {
              "lexeme": "x_step",
              "access": "read",
              "symbolId": "step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.step_coordinates",
              "occurrences": [
                {
                  "start": 29,
                  "end": 35
                }
              ]
            },
            {
              "lexeme": "x_hat",
              "access": "read",
              "symbolId": "coordinate_prediction",
              "tex": "\\hat{x}_0",
              "architectureRef": "value_sites.coordinate_prediction",
              "occurrences": [
                {
                  "start": 37,
                  "end": 42
                }
              ]
            },
            {
              "lexeme": "t",
              "access": "read",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 44,
                  "end": 45
                }
              ]
            }
          ]
        },
        {
          "id": "prepare_sampler_math",
          "text": "x_sampler = x_step",
          "refs": "DDIMSampler._step",
          "sourceRefs": [
            {
              "source": "ddim_code",
              "locator": "DDIMSampler._step"
            }
          ],
          "scopeRef": "scopes.sampler_math",
          "statementRef": "relations.step_coordinates_enter_sampler_math",
          "architectureRefs": [
            "relations.step_coordinates_enter_sampler_math"
          ],
          "operation": "prepare_fixed_sampler_math_input",
          "inputs": [
            "step_coordinates"
          ],
          "outputs": [
            "sampler_step_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_sampler",
              "access": "write",
              "symbolId": "sampler_step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.sampler_step_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "x_step",
              "access": "read",
              "symbolId": "step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.step_coordinates",
              "occurrences": [
                {
                  "start": 12,
                  "end": 18
                }
              ]
            }
          ]
        },
        {
          "id": "read_noise",
          "text": "epsilon_theta = x_sampler - x_hat",
          "refs": "DDIMSampler._step",
          "sourceRefs": [
            {
              "source": "ddim_code",
              "locator": "DDIMSampler._step"
            }
          ],
          "scopeRef": "scopes.sampler_math",
          "statementRef": "modules.noise_readout",
          "architectureRefs": [
            "modules.noise_readout",
            "claims.sampler_math_is_outside_the_denoiser"
          ],
          "operation": "coordinate_displacement_readout",
          "inputs": [
            "sampler_step_coordinates",
            "coordinate_prediction"
          ],
          "outputs": [
            "predicted_noise"
          ],
          "codeBindings": [
            {
              "lexeme": "epsilon_theta",
              "access": "write",
              "symbolId": "predicted_noise",
              "tex": "\\epsilon_\\theta",
              "architectureRef": "value_sites.predicted_noise",
              "occurrences": [
                {
                  "start": 0,
                  "end": 13
                }
              ]
            },
            {
              "lexeme": "x_sampler",
              "access": "read",
              "symbolId": "sampler_step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.sampler_step_coordinates",
              "occurrences": [
                {
                  "start": 16,
                  "end": 25
                }
              ]
            },
            {
              "lexeme": "x_hat",
              "access": "read",
              "symbolId": "coordinate_prediction",
              "tex": "\\hat{x}_0",
              "architectureRef": "value_sites.coordinate_prediction",
              "occurrences": [
                {
                  "start": 28,
                  "end": 33
                }
              ]
            }
          ]
        },
        {
          "id": "ddim_step",
          "text": "x_next = DDIMUpdate(x_sampler, epsilon_theta, t)",
          "refs": "DDIMSampler._step",
          "sourceRefs": [
            {
              "source": "ddim_code",
              "locator": "DDIMSampler._step"
            }
          ],
          "scopeRef": "scopes.sampler_math",
          "statementRef": "modules.ddim_update",
          "architectureRefs": [
            "modules.ddim_update"
          ],
          "operation": "directional_ddim_update",
          "inputs": [
            "sampler_step_coordinates",
            "predicted_noise",
            "timestep"
          ],
          "outputs": [
            "next_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_next",
              "access": "write",
              "symbolId": "next_coordinates",
              "tex": "x_{t-10}",
              "architectureRef": "value_sites.next_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "DDIMUpdate",
              "access": "call",
              "architectureRef": "modules.ddim_update",
              "occurrences": [
                {
                  "start": 9,
                  "end": 19
                }
              ]
            },
            {
              "lexeme": "x_sampler",
              "access": "read",
              "symbolId": "sampler_step_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.sampler_step_coordinates",
              "occurrences": [
                {
                  "start": 20,
                  "end": 29
                }
              ]
            },
            {
              "lexeme": "epsilon_theta",
              "access": "read",
              "symbolId": "predicted_noise",
              "tex": "\\epsilon_\\theta",
              "architectureRef": "value_sites.predicted_noise",
              "occurrences": [
                {
                  "start": 31,
                  "end": 44
                }
              ]
            },
            {
              "lexeme": "t",
              "access": "read",
              "symbolId": "timestep",
              "architectureRef": "value_sites.timestep",
              "occurrences": [
                {
                  "start": 46,
                  "end": 47
                }
              ]
            }
          ]
        },
        {
          "id": "advance_sampling_state",
          "text": "x_t = x_next",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "relations.next_coordinates_reenter_sampling_state",
          "architectureRefs": [
            "relations.next_coordinates_reenter_sampling_state",
            "execution.loops.reverse_diffusion_loop"
          ],
          "operation": "advance_sampling_state",
          "inputs": [
            "next_coordinates"
          ],
          "outputs": [
            "current_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_t",
              "access": "write",
              "symbolId": "current_coordinates",
              "tex": "x_t",
              "architectureRef": "value_sites.current_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "x_next",
              "access": "read",
              "symbolId": "next_coordinates",
              "tex": "x_{t-10}",
              "architectureRef": "value_sites.next_coordinates",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "finish_sampling_state",
          "text": "x_0 = x_next",
          "refs": "Sampler._sample",
          "sourceRefs": [
            {
              "source": "sampler_code",
              "locator": "Sampler._sample"
            }
          ],
          "scopeRef": "scopes.sampling",
          "statementRef": "relations.terminal_coordinates_become_final_coordinates",
          "architectureRefs": [
            "relations.terminal_coordinates_become_final_coordinates"
          ],
          "operation": "select_terminal_coordinates",
          "inputs": [
            "next_coordinates"
          ],
          "outputs": [
            "final_coordinates"
          ],
          "codeBindings": [
            {
              "lexeme": "x_0",
              "access": "write",
              "symbolId": "final_coordinates",
              "tex": "x_0",
              "architectureRef": "value_sites.final_coordinates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "x_next",
              "access": "read",
              "symbolId": "next_coordinates",
              "tex": "x_{t-10}",
              "architectureRef": "value_sites.next_coordinates",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "export_structure",
          "text": "design_pdb = ExportPDB(x_0)",
          "refs": "PostProcessor.save and PostProcessor._update_structure",
          "sourceRefs": [
            {
              "source": "export_code",
              "locator": "PostProcessor.save and PostProcessor._update_structure"
            }
          ],
          "scopeRef": "scopes.inference",
          "statementRef": "modules.pdb_exporter",
          "architectureRefs": [
            "modules.pdb_exporter"
          ],
          "operation": "serialize_pdb",
          "inputs": [
            "final_coordinates"
          ],
          "outputs": [
            "generated_design_pdb"
          ],
          "codeBindings": [
            {
              "lexeme": "design_pdb",
              "access": "write",
              "symbolId": "generated_design_pdb",
              "architectureRef": "value_sites.generated_design_pdb",
              "occurrences": [
                {
                  "start": 0,
                  "end": 10
                }
              ]
            },
            {
              "lexeme": "ExportPDB",
              "access": "call",
              "architectureRef": "modules.pdb_exporter",
              "occurrences": [
                {
                  "start": 13,
                  "end": 22
                }
              ]
            },
            {
              "lexeme": "x_0",
              "access": "read",
              "symbolId": "final_coordinates",
              "tex": "x_0",
              "architectureRef": "value_sites.final_coordinates",
              "occurrences": [
                {
                  "start": 23,
                  "end": 26
                }
              ]
            }
          ]
        }
      ],
      "claims": [
        {
          "id": "point_cloud_is_the_diffusion_state",
          "statement": "Genie 3 samples a coordinate point cloud. Frenet frames are a derived denoiser representation, even though the paper describes the reverse process in frame-cloud terms.",
          "line_refs": [
            "initialize_coordinates",
            "derive_frames",
            "ddim_step"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_sampler_code",
                "role": "implementation_evidence",
                "locator": "Sampler._sample"
              },
              {
                "source_ref": "genie3_geometry_code",
                "role": "implementation_evidence",
                "locator": "compute_noisy_structure_frames"
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/genie3.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/genie3-semantic-zoom.view.yaml",
    "rootBoard": "design_overview",
    "items": [
      {
        "id": "design_overview",
        "title": "Genie 3 Protein Design",
        "summary": "A length, motif, or binder request becomes task-dependent token features. Genie 3 denoises a coordinate point cloud, optionally predicts residue identities, and exports a protein design.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 9,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 44
        },
        "nodes": [
          {
            "id": "design_request",
            "ref": "value_sites.design_request",
            "label": "design request",
            "notation": "length / motif / target",
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
            "row": 2,
            "board_ref": "task_featurization"
          },
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "feature dictionary",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "diffusion_sampler",
            "ref": "modules.diffusion_sampler",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "sampling_loop"
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "generated token coordinates",
            "notation": "x_0",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "predicted_sequence",
            "ref": "value_sites.predicted_sequence",
            "label": "optional sequence",
            "notation": "a",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 5,
            "row": 3
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
            "id": "generated_design_pdb",
            "ref": "value_sites.generated_design_pdb",
            "label": "generated protein PDB",
            "notation": ".pdb",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "volume",
            "col": 7,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.single_feature_embedder",
            "reason": "Internal uses of task features are expanded on the denoiser board; the root keeps one feature-bundle-to-sampler connection."
          },
          {
            "ref": "modules.pair_feature_embedder",
            "reason": "Pair geometry construction is internal to the denoiser."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Token masks and frame conditioning inside IPA are expanded on the structure-decoder board."
          },
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frame construction is expanded inside the sampling loop."
          },
          {
            "ref": "modules.sequence_sampler",
            "reason": "The optional sequence branch is represented by its root-level output rather than another task-level module."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.design_request_enters_feature_builder"
            },
            "label": "task + constraints",
            "connection": {
              "title": "Design request",
              "role": "task boundary input",
              "inside": "The request selects unconditional generation, motif scaffolding, or binder design and supplies the corresponding length or structural constraints."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_builder_produces_feature_bundle"
            },
            "tone": "conditioning",
            "connection": {
              "title": "Task-dependent tokenization",
              "role": "prepared conditioning",
              "inside": "Unknown scaffold residues become C-alpha tokens; known motif or interface residues can expand into atom14-ordered heavy-atom tokens."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sizes_coordinate_initializer"
            },
            "connection": {
              "title": "Features enter sampling",
              "role": "cached sampling context",
              "inside": "The bundle fixes the active token layout and remains read-only throughout reverse diffusion."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "x_0",
            "connection": {
              "title": "Generated point cloud",
              "role": "sampler output",
              "inside": "The terminal state contains one coordinate for every active C-alpha or atomized heavy-atom token."
            }
          },
          {
            "match": {
              "relation_ref": "relations.predicted_sequence_enters_pdb_exporter"
            },
            "label": "optional identities",
            "tone": "conditioning",
            "connection": {
              "title": "Optional sequence assignment",
              "role": "export context",
              "inside": "When sequence prediction is enabled, sampled residue identities fill unknown designed positions before serialization."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pdb_exporter_writes_design_pdb"
            },
            "label": "PDB records",
            "connection": {
              "title": "Generated protein design",
              "role": "task boundary output",
              "inside": "The exporter restores coordinates and identities to PDB records for the modeled token set."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_b02be531dc86",
            "from": "design_request",
            "to": "feature_builder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.design_request_enters_feature_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.design_request_enters_feature_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "task + constraints",
              "connection": {
                "title": "Design request",
                "role": "task boundary input",
                "inside": "The request selects unconditional generation, motif scaffolding, or binder design and supplies the corresponding length or structural constraints."
              }
            }
          },
          {
            "id": "projection_0da62da4ae92",
            "from": "diffusion_sampler",
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
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "x_0",
              "connection": {
                "title": "Generated point cloud",
                "role": "sampler output",
                "inside": "The terminal state contains one coordinate for every active C-alpha or atomized heavy-atom token."
              }
            }
          },
          {
            "id": "projection_58ea1b4c269a",
            "from": "feature_builder",
            "to": "feature_bundle",
            "projection": "boundary",
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
              "tone": "conditioning",
              "connection": {
                "title": "Task-dependent tokenization",
                "role": "prepared conditioning",
                "inside": "Unknown scaffold residues become C-alpha tokens; known motif or interface residues can expand into atom14-ordered heavy-atom tokens."
              }
            }
          },
          {
            "id": "projection_0ea228223cf3",
            "from": "feature_bundle",
            "to": "diffusion_sampler",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sizes_coordinate_initializer"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sizes_coordinate_initializer"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "connection": {
                "title": "Features enter sampling",
                "role": "cached sampling context",
                "inside": "The bundle fixes the active token layout and remains read-only throughout reverse diffusion."
              }
            }
          },
          {
            "id": "projection_60325d5ce7a8",
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
              "representations.token_coordinates"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_811bc68c0781",
            "from": "pdb_exporter",
            "to": "generated_design_pdb",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pdb_exporter_writes_design_pdb"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pdb_exporter_writes_design_pdb"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.protein_pdb"
            ],
            "presentation": {
              "label": "PDB records",
              "connection": {
                "title": "Generated protein design",
                "role": "task boundary output",
                "inside": "The exporter restores coordinates and identities to PDB records for the modeled token set."
              }
            }
          },
          {
            "id": "projection_f1d7065222ba",
            "from": "predicted_sequence",
            "to": "pdb_exporter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.predicted_sequence_enters_pdb_exporter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.predicted_sequence_enters_pdb_exporter"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.protein_sequence"
            ],
            "presentation": {
              "label": "optional identities",
              "tone": "conditioning",
              "connection": {
                "title": "Optional sequence assignment",
                "role": "export context",
                "inside": "When sequence prediction is enabled, sampled residue identities fill unknown designed positions before serialization."
              }
            }
          }
        ],
        "classifications": {
          "modules.binder_target_feature_assembler": "collapsed:modules.feature_builder",
          "modules.binder_tokens": "collapsed:modules.feature_builder",
          "modules.coordinate_initializer": "collapsed:modules.diffusion_sampler",
          "modules.ddim_update": "collapsed:modules.diffusion_sampler",
          "modules.diffusion_sampler": "visible",
          "modules.feature_batch_assembler": "collapsed:modules.feature_builder",
          "modules.feature_builder": "visible",
          "modules.frame_update": "collapsed:modules.diffusion_sampler",
          "modules.frenet_frame_builder": "excluded",
          "modules.global_token_adapter": "collapsed:modules.diffusion_sampler",
          "modules.invariant_point_attention": "excluded",
          "modules.motif_conditioned_tokens": "collapsed:modules.feature_builder",
          "modules.motif_feature_assembler": "collapsed:modules.feature_builder",
          "modules.motif_featurizer": "collapsed:modules.feature_builder",
          "modules.motif_problem_parser": "collapsed:modules.feature_builder",
          "modules.motif_scaffold_tokens": "collapsed:modules.feature_builder",
          "modules.noise_readout": "collapsed:modules.diffusion_sampler",
          "modules.pair_biased_attention_update": "collapsed:modules.diffusion_sampler",
          "modules.pair_feature_embedder": "excluded",
          "modules.pair_transition": "collapsed:modules.diffusion_sampler",
          "modules.pdb_exporter": "visible",
          "modules.sequence_head": "collapsed:modules.diffusion_sampler",
          "modules.sequence_sampler": "excluded",
          "modules.single_feature_embedder": "excluded",
          "modules.single_to_pair_update": "collapsed:modules.diffusion_sampler",
          "modules.structure_transition": "collapsed:modules.diffusion_sampler",
          "modules.target_conditioned_tokens": "collapsed:modules.feature_builder",
          "modules.target_featurizer": "collapsed:modules.feature_builder",
          "modules.target_problem_parser": "collapsed:modules.feature_builder",
          "modules.task_source_router": "collapsed:modules.feature_builder",
          "modules.timestep_controller": "collapsed:modules.diffusion_sampler",
          "modules.triangle_multiplication_stack": "collapsed:modules.diffusion_sampler",
          "modules.unconditional_featurizer": "collapsed:modules.feature_builder",
          "modules.unconditional_frame_indices": "collapsed:modules.feature_builder",
          "modules.unconditional_placeholder_initializer": "collapsed:modules.feature_builder",
          "modules.unconditional_token_layout": "collapsed:modules.feature_builder",
          "value_sites.coordinate_prediction": "collapsed:modules.diffusion_sampler",
          "value_sites.current_coordinates": "collapsed:modules.diffusion_sampler",
          "value_sites.current_frames": "collapsed:modules.diffusion_sampler",
          "value_sites.decoder_frames": "collapsed:modules.diffusion_sampler",
          "value_sites.decoder_output_frames": "collapsed:modules.diffusion_sampler",
          "value_sites.decoder_single_state": "collapsed:modules.diffusion_sampler",
          "value_sites.design_request": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "collapsed:modules.diffusion_sampler",
          "value_sites.generated_design_pdb": "visible",
          "value_sites.initial_coordinates": "collapsed:modules.diffusion_sampler",
          "value_sites.initial_pair_features": "collapsed:modules.diffusion_sampler",
          "value_sites.initial_single_features": "collapsed:modules.diffusion_sampler",
          "value_sites.next_coordinates": "collapsed:modules.diffusion_sampler",
          "value_sites.pair_after_single_update": "collapsed:modules.diffusion_sampler",
          "value_sites.pair_after_transition": "collapsed:modules.diffusion_sampler",
          "value_sites.pair_after_triangle_updates": "collapsed:modules.diffusion_sampler",
          "value_sites.pair_with_global_tokens": "collapsed:modules.diffusion_sampler",
          "value_sites.predicted_noise": "collapsed:modules.diffusion_sampler",
          "value_sites.predicted_sequence": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.diffusion_sampler",
          "value_sites.refined_single_features": "collapsed:modules.diffusion_sampler",
          "value_sites.sampler_step_coordinates": "collapsed:modules.diffusion_sampler",
          "value_sites.sequence_logits": "collapsed:modules.diffusion_sampler",
          "value_sites.single_after_ipa": "collapsed:modules.diffusion_sampler",
          "value_sites.single_after_pair_attention": "collapsed:modules.diffusion_sampler",
          "value_sites.single_after_transition": "collapsed:modules.diffusion_sampler",
          "value_sites.single_with_global_tokens": "collapsed:modules.diffusion_sampler",
          "value_sites.step_coordinates": "collapsed:modules.diffusion_sampler",
          "value_sites.timestep": "collapsed:modules.diffusion_sampler",
          "value_sites.updated_frames": "collapsed:modules.diffusion_sampler"
        },
        "projectionMode": "derived"
      },
      {
        "id": "sampling_loop",
        "title": "100-Step Directional DDIM Sampling",
        "summary": "Gaussian token coordinates initialize x_T. One drillable reverse-step unit reruns 100 times with cached task features, then optional sequence sampling happens after the terminal coordinates are selected.",
        "parent": "design_overview",
        "subject_ref": "modules.diffusion_sampler",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 44
        },
        "regions": [
          {
            "id": "reverse_diffusion_iteration",
            "kind": "repeat",
            "execution_ref": "execution.loops.reverse_diffusion_loop",
            "label": "one reverse step",
            "node_ids": [
              "current_coordinates",
              "reverse_diffusion_step",
              "next_coordinates"
            ],
            "iteration_relation_refs": [
              "relations.next_coordinates_reenter_sampling_state"
            ]
          }
        ],
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "cached feature dictionary",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 1
          },
          {
            "id": "coordinate_initializer",
            "ref": "modules.coordinate_initializer",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "current_coordinates",
            "ref": "value_sites.current_coordinates",
            "label": "current coordinate point cloud",
            "notation": "x_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "reverse_diffusion_step",
            "ref": "modules.reverse_diffusion_step",
            "label": "Directional DDIM Reverse Step",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "reverse_diffusion_step"
          },
          {
            "id": "next_coordinates",
            "ref": "value_sites.next_coordinates",
            "label": "next coordinate point cloud",
            "notation": "x_{t-10}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "final coordinates",
            "notation": "x_0",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "sequence_sampler",
            "ref": "modules.sequence_sampler",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 4
          },
          {
            "id": "predicted_sequence",
            "ref": "value_sites.predicted_sequence",
            "label": "optional sequence",
            "notation": "a",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 7,
            "row": 4
          }
        ],
        "elide": [
          {
            "ref": "value_sites.initial_coordinates"
          }
        ],
        "exclude": [
          {
            "ref": "modules.single_feature_embedder",
            "reason": "Learned feature conditioning is expanded through the reverse-step and denoiser boards."
          },
          {
            "ref": "modules.pair_feature_embedder",
            "reason": "Learned pair-feature construction is expanded through the reverse-step and denoiser boards."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Frame-point attention is expanded below the reverse-step board on the structure-decoder board."
          },
          {
            "ref": "modules.frame_update",
            "reason": "Internal frame updates are summarized by the drillable reverse-step unit at this zoom level."
          },
          {
            "ref": "value_sites.sequence_logits",
            "reason": "The sampler overview shows the optional terminal sequence rather than intermediate model logits."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sizes_coordinate_initializer"
            },
            "label": "active token layout",
            "tone": "conditioning",
            "connection": {
              "title": "Coordinate-state shape",
              "role": "initialization context",
              "inside": "The cached token layout fixes the B by N by 3 tensor initialized at the start of sampling."
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
              "title": "Initial point cloud",
              "role": "reverse-chain initialization",
              "inside": "The active token layout sizes a standard-normal B by N by 3 coordinate tensor."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_frame_builder"
            },
            "label": "cached features",
            "tone": "conditioning",
            "connection": {
              "title": "Read-only step context",
              "role": "repeated conditioning",
              "inside": "Each reverse step reuses the cached neighbor indices and masks; the child boards expose the remaining learned feature uses."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_coordinates_enter_reverse_step"
            },
            "label": "x_t",
            "connection": {
              "title": "Current reverse state",
              "role": "reverse-step input",
              "inside": "The drillable step rebuilds geometry, invokes the learned model, and applies fixed sampler math to the current coordinate point cloud."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ddim_update_produces_next_coordinates"
            },
            "label": "one reverse step",
            "connection": {
              "title": "Updated coordinate state",
              "role": "reverse-step output",
              "inside": "Directional DDIM math produces the coordinate point cloud for the next selected schedule index."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "after final step",
            "connection": {
              "title": "Terminal structure",
              "role": "sampler output",
              "inside": "When no selected timesteps remain, the next coordinate state is exposed as x_0."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_coordinates_enter_sequence_sampler"
            },
            "label": "optional final call",
            "tone": "conditioning",
            "connection": {
              "title": "Optional sequence prediction",
              "role": "post-structure branch",
              "inside": "When enabled, the sampler calls the model once more on the generated structure before sampling residue identities."
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
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "Gaussian x_T",
              "connection": {
                "title": "Initial point cloud",
                "role": "reverse-chain initialization",
                "inside": "The active token layout sizes a standard-normal B by N by 3 coordinate tensor."
              }
            }
          },
          {
            "id": "projection_459d39a6b516",
            "from": "current_coordinates",
            "to": "reverse_diffusion_step",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_coordinates_enter_reverse_step"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_coordinates_enter_reverse_step"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current reverse state",
                "role": "reverse-step input",
                "inside": "The drillable step rebuilds geometry, invokes the learned model, and applies fixed sampler math to the current coordinate point cloud."
              }
            }
          },
          {
            "id": "projection_8cdda49e0892",
            "from": "feature_bundle",
            "to": "coordinate_initializer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sizes_coordinate_initializer"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sizes_coordinate_initializer"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "active token layout",
              "tone": "conditioning",
              "connection": {
                "title": "Coordinate-state shape",
                "role": "initialization context",
                "inside": "The cached token layout fixes the B by N by 3 tensor initialized at the start of sampling."
              }
            }
          },
          {
            "id": "projection_3f9a00a80242",
            "from": "feature_bundle",
            "to": "reverse_diffusion_step",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_frame_builder"
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
                "title": "Read-only step context",
                "role": "repeated conditioning",
                "inside": "Each reverse step reuses the cached neighbor indices and masks; the child boards expose the remaining learned feature uses."
              }
            }
          },
          {
            "id": "projection_7d68a4f2ddd3",
            "from": "feature_bundle",
            "to": "sequence_sampler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_sequence_sampler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_sequence_sampler"
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
            "id": "projection_650c3880a40d",
            "from": "final_coordinates",
            "to": "sequence_sampler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.final_coordinates_enter_sequence_sampler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_coordinates_enter_sequence_sampler"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "optional final call",
              "tone": "conditioning",
              "connection": {
                "title": "Optional sequence prediction",
                "role": "post-structure branch",
                "inside": "When enabled, the sampler calls the model once more on the generated structure before sampling residue identities."
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
              "representations.token_coordinates"
            ],
            "presentation": {
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
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "after final step",
              "connection": {
                "title": "Terminal structure",
                "role": "sampler output",
                "inside": "When no selected timesteps remain, the next coordinate state is exposed as x_0."
              }
            }
          },
          {
            "id": "projection_6d21076d7ec3",
            "from": "reverse_diffusion_step",
            "to": "next_coordinates",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ddim_update_produces_next_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ddim_update_produces_next_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "one reverse step",
              "connection": {
                "title": "Updated coordinate state",
                "role": "reverse-step output",
                "inside": "Directional DDIM math produces the coordinate point cloud for the next selected schedule index."
              }
            }
          },
          {
            "id": "projection_2d4ef6842316",
            "from": "sequence_sampler",
            "to": "predicted_sequence",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.sequence_sampler_produces_predicted_sequence"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.sequence_sampler_produces_predicted_sequence"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.protein_sequence"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.coordinate_initializer": "visible",
          "modules.ddim_update": "collapsed:modules.reverse_diffusion_step",
          "modules.frame_update": "excluded",
          "modules.frenet_frame_builder": "collapsed:modules.reverse_diffusion_step",
          "modules.global_token_adapter": "collapsed:modules.reverse_diffusion_step",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.reverse_diffusion_step",
          "modules.pair_biased_attention_update": "collapsed:modules.reverse_diffusion_step",
          "modules.pair_feature_embedder": "excluded",
          "modules.pair_transition": "collapsed:modules.reverse_diffusion_step",
          "modules.reverse_diffusion_step": "visible",
          "modules.sequence_head": "collapsed:modules.reverse_diffusion_step",
          "modules.sequence_sampler": "visible",
          "modules.single_feature_embedder": "excluded",
          "modules.single_to_pair_update": "collapsed:modules.reverse_diffusion_step",
          "modules.structure_transition": "collapsed:modules.reverse_diffusion_step",
          "modules.timestep_controller": "collapsed:modules.reverse_diffusion_step",
          "modules.triangle_multiplication_stack": "collapsed:modules.reverse_diffusion_step",
          "value_sites.coordinate_prediction": "collapsed:modules.reverse_diffusion_step",
          "value_sites.current_coordinates": "visible",
          "value_sites.current_frames": "collapsed:modules.reverse_diffusion_step",
          "value_sites.decoder_frames": "collapsed:modules.reverse_diffusion_step",
          "value_sites.decoder_output_frames": "collapsed:modules.reverse_diffusion_step",
          "value_sites.decoder_single_state": "collapsed:modules.reverse_diffusion_step",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "collapsed:modules.reverse_diffusion_step",
          "value_sites.initial_coordinates": "elided",
          "value_sites.initial_pair_features": "collapsed:modules.reverse_diffusion_step",
          "value_sites.initial_single_features": "collapsed:modules.reverse_diffusion_step",
          "value_sites.next_coordinates": "visible",
          "value_sites.pair_after_single_update": "collapsed:modules.reverse_diffusion_step",
          "value_sites.pair_after_transition": "collapsed:modules.reverse_diffusion_step",
          "value_sites.pair_after_triangle_updates": "collapsed:modules.reverse_diffusion_step",
          "value_sites.pair_with_global_tokens": "collapsed:modules.reverse_diffusion_step",
          "value_sites.predicted_noise": "collapsed:modules.reverse_diffusion_step",
          "value_sites.predicted_sequence": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.reverse_diffusion_step",
          "value_sites.refined_single_features": "collapsed:modules.reverse_diffusion_step",
          "value_sites.sampler_step_coordinates": "collapsed:modules.reverse_diffusion_step",
          "value_sites.sequence_logits": "excluded",
          "value_sites.single_after_ipa": "collapsed:modules.reverse_diffusion_step",
          "value_sites.single_after_pair_attention": "collapsed:modules.reverse_diffusion_step",
          "value_sites.single_after_transition": "collapsed:modules.reverse_diffusion_step",
          "value_sites.single_with_global_tokens": "collapsed:modules.reverse_diffusion_step",
          "value_sites.step_coordinates": "collapsed:modules.reverse_diffusion_step",
          "value_sites.timestep": "collapsed:modules.reverse_diffusion_step",
          "value_sites.updated_frames": "collapsed:modules.reverse_diffusion_step"
        },
        "projectionMode": "derived"
      },
      {
        "id": "reverse_diffusion_step",
        "title": "One Reverse Step",
        "summary": "Each step does three things—build local geometry from the current coordinates, predict a cleaner structure with the learned model, and apply fixed DDIM math to produce the next coordinates.",
        "parent": "sampling_loop",
        "subject_ref": "modules.reverse_diffusion_step",
        "expansion_depth": 1,
        "grid": {
          "columns": 6,
          "rows": 3,
          "column_sizing": "content",
          "col_gap": 56
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "cached task context",
            "notation": "F",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "selected level",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 5,
            "row": 1
          },
          {
            "id": "step_coordinates",
            "ref": "value_sites.step_coordinates",
            "label": "current coordinates",
            "notation": "x_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "frenet_frame_builder",
            "ref": "modules.frenet_frame_builder",
            "label": "Build local frames",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "local frames",
            "notation": "T_t",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "denoiser",
            "ref": "modules.denoiser",
            "label": "Predict cleaner coordinates",
            "prominence": "secondary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "denoiser_forward"
          },
          {
            "id": "directional_ddim_sampler_math",
            "ref": "modules.directional_ddim_sampler_math",
            "label": "Apply fixed DDIM update",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 2,
            "board_ref": "directional_ddim_sampler_math"
          },
          {
            "id": "next_coordinates",
            "ref": "value_sites.next_coordinates",
            "label": "next coordinates",
            "notation": "x_{t-10}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          }
        ],
        "elide": [
          {
            "ref": "value_sites.coordinate_prediction"
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.current_coordinates",
            "reason": "The step-local x_t value is shown explicitly; the sampler-level state handoff is already visible on the parent board."
          },
          {
            "ref": "modules.timestep_controller",
            "reason": "This board starts from the already-selected noise level; the enclosing 100-step sampling board owns the strided reverse schedule."
          },
          {
            "ref": "modules.pair_feature_embedder",
            "reason": "Noisy frame geometry is expanded on the denoiser board."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Frame-point attention is expanded on the structure-decoder board."
          },
          {
            "ref": "modules.frame_update",
            "reason": "The coordinate estimate summarizes the structure decoder's internal frame updates."
          },
          {
            "ref": "value_sites.sequence_logits",
            "reason": "Optional sequence logits are sampled only after the reverse chain and are outside one coordinate-update step."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.step_coordinates_enter_frame_builder"
            },
            "label": "build geometry",
            "connection": {
              "title": "Build local geometry",
              "role": "first step action",
              "inside": "The current point cloud supplies translations for deterministic local frame construction."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_frame_builder"
            },
            "label": "token layout",
            "tone": "conditioning",
            "connection": {
              "title": "Cached geometry context",
              "role": "frame-building context",
              "inside": "Neighbor indices and masks say which coordinates define each local frame."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_embedder"
            },
            "label": "noise level",
            "tone": "conditioning",
            "connection": {
              "title": "Model noise level",
              "role": "learned-model context",
              "inside": "The selected reverse index tells the denoiser how noisy the current coordinates are."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_embedder"
            },
            "label": "task context",
            "tone": "conditioning",
            "connection": {
              "title": "Cached task context",
              "role": "learned-model context",
              "inside": "Token identity, masks, and design constraints condition the learned coordinate prediction."
            }
          },
          {
            "match": {
              "relation_ref": "relations.frame_builder_produces_current_frames"
            },
            "label": "local frames",
            "connection": {
              "title": "Rebuilt local frames",
              "role": "geometric intermediate",
              "inside": "Deterministic rotations are rebuilt while translations remain the current token coordinates."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_initialize_decoder_frames"
            },
            "label": "use geometry",
            "connection": {
              "title": "Predict cleaner coordinates",
              "role": "second step action",
              "inside": "The learned model uses the rebuilt local frames to estimate cleaner token coordinates."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.updated_frames_produce_coordinate_prediction",
                "relations.coordinate_prediction_enters_noise_readout"
              ]
            },
            "label": "cleaner estimate",
            "connection": {
              "title": "Apply fixed sampler math",
              "role": "third step action",
              "inside": "Fixed sampler math compares the cleaner estimate with the current coordinates and constructs the next state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.step_coordinates_enter_sampler_math"
            },
            "label": "reuse x_t",
            "route_side": "bottom",
            "route_clearance": 46,
            "connection": {
              "title": "Current-state term",
              "role": "fixed-math input",
              "inside": "The DDIM formula also uses the current coordinates directly when reconstructing the next state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_enters_ddim_update"
            },
            "label": "schedule coefficients",
            "tone": "conditioning",
            "connection": {
              "title": "Fixed schedule coefficients",
              "role": "fixed-math context",
              "inside": "The selected reverse index chooses the coefficients used by the directional DDIM formula."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ddim_update_produces_next_coordinates"
            },
            "label": "next state",
            "connection": {
              "title": "Next coordinate state",
              "role": "reverse-step output",
              "inside": "The fixed update emits the point cloud used by the following reverse step."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_4985859b203d",
            "from": "current_frames",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_initialize_decoder_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_initialize_decoder_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
              "label": "use geometry",
              "connection": {
                "title": "Predict cleaner coordinates",
                "role": "second step action",
                "inside": "The learned model uses the rebuilt local frames to estimate cleaner token coordinates."
              }
            }
          },
          {
            "id": "projection_cbf66040d57b",
            "from": "denoiser",
            "to": "directional_ddim_sampler_math",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.updated_frames_produce_coordinate_prediction",
              "relations.coordinate_prediction_enters_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_produce_coordinate_prediction"
              },
              {
                "relation_ref": "relations.coordinate_prediction_enters_noise_readout"
              }
            ],
            "hidden_refs": [
              "value_sites.coordinate_prediction"
            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "cleaner estimate",
              "connection": {
                "title": "Apply fixed sampler math",
                "role": "third step action",
                "inside": "Fixed sampler math compares the cleaner estimate with the current coordinates and constructs the next state."
              }
            }
          },
          {
            "id": "projection_056b4566b846",
            "from": "directional_ddim_sampler_math",
            "to": "next_coordinates",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ddim_update_produces_next_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ddim_update_produces_next_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "next state",
              "connection": {
                "title": "Next coordinate state",
                "role": "reverse-step output",
                "inside": "The fixed update emits the point cloud used by the following reverse step."
              }
            }
          },
          {
            "id": "projection_d4a1c3249874",
            "from": "feature_bundle",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "task context",
              "tone": "conditioning",
              "connection": {
                "title": "Cached task context",
                "role": "learned-model context",
                "inside": "Token identity, masks, and design constraints condition the learned coordinate prediction."
              }
            }
          },
          {
            "id": "projection_db706d71ad18",
            "from": "feature_bundle",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "token layout",
              "tone": "conditioning",
              "connection": {
                "title": "Cached geometry context",
                "role": "frame-building context",
                "inside": "Neighbor indices and masks say which coordinates define each local frame."
              }
            }
          },
          {
            "id": "projection_2970c865c356",
            "from": "frenet_frame_builder",
            "to": "current_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.frame_builder_produces_current_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.frame_builder_produces_current_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
              "label": "local frames",
              "connection": {
                "title": "Rebuilt local frames",
                "role": "geometric intermediate",
                "inside": "Deterministic rotations are rebuilt while translations remain the current token coordinates."
              }
            }
          },
          {
            "id": "projection_82d09dc48642",
            "from": "step_coordinates",
            "to": "directional_ddim_sampler_math",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.step_coordinates_enter_sampler_math"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.step_coordinates_enter_sampler_math"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "reuse x_t",
              "route_side": "bottom",
              "route_clearance": 46,
              "connection": {
                "title": "Current-state term",
                "role": "fixed-math input",
                "inside": "The DDIM formula also uses the current coordinates directly when reconstructing the next state."
              }
            }
          },
          {
            "id": "projection_1023040363ba",
            "from": "step_coordinates",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.step_coordinates_enter_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.step_coordinates_enter_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "build geometry",
              "connection": {
                "title": "Build local geometry",
                "role": "first step action",
                "inside": "The current point cloud supplies translations for deterministic local frame construction."
              }
            }
          },
          {
            "id": "projection_2eb9af868c1c",
            "from": "timestep",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "noise level",
              "tone": "conditioning",
              "connection": {
                "title": "Model noise level",
                "role": "learned-model context",
                "inside": "The selected reverse index tells the denoiser how noisy the current coordinates are."
              }
            }
          },
          {
            "id": "projection_cb818673035b",
            "from": "timestep",
            "to": "directional_ddim_sampler_math",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_enters_ddim_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_enters_ddim_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "schedule coefficients",
              "tone": "conditioning",
              "connection": {
                "title": "Fixed schedule coefficients",
                "role": "fixed-math context",
                "inside": "The selected reverse index chooses the coefficients used by the directional DDIM formula."
              }
            }
          }
        ],
        "classifications": {
          "modules.ddim_update": "collapsed:modules.directional_ddim_sampler_math",
          "modules.denoiser": "visible",
          "modules.directional_ddim_sampler_math": "visible",
          "modules.frame_update": "excluded",
          "modules.frenet_frame_builder": "visible",
          "modules.global_token_adapter": "collapsed:modules.denoiser",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.directional_ddim_sampler_math",
          "modules.pair_biased_attention_update": "collapsed:modules.denoiser",
          "modules.pair_feature_embedder": "excluded",
          "modules.pair_transition": "collapsed:modules.denoiser",
          "modules.sequence_head": "collapsed:modules.denoiser",
          "modules.single_feature_embedder": "collapsed:modules.denoiser",
          "modules.single_to_pair_update": "collapsed:modules.denoiser",
          "modules.structure_transition": "collapsed:modules.denoiser",
          "modules.timestep_controller": "excluded",
          "modules.triangle_multiplication_stack": "collapsed:modules.denoiser",
          "value_sites.coordinate_prediction": "elided",
          "value_sites.current_coordinates": "excluded",
          "value_sites.current_frames": "visible",
          "value_sites.decoder_frames": "collapsed:modules.denoiser",
          "value_sites.decoder_output_frames": "collapsed:modules.denoiser",
          "value_sites.decoder_single_state": "collapsed:modules.denoiser",
          "value_sites.feature_bundle": "visible",
          "value_sites.fresh_step_noise": "collapsed:modules.directional_ddim_sampler_math",
          "value_sites.initial_pair_features": "collapsed:modules.denoiser",
          "value_sites.initial_single_features": "collapsed:modules.denoiser",
          "value_sites.next_coordinates": "visible",
          "value_sites.pair_after_single_update": "collapsed:modules.denoiser",
          "value_sites.pair_after_transition": "collapsed:modules.denoiser",
          "value_sites.pair_after_triangle_updates": "collapsed:modules.denoiser",
          "value_sites.pair_with_global_tokens": "collapsed:modules.denoiser",
          "value_sites.predicted_noise": "collapsed:modules.directional_ddim_sampler_math",
          "value_sites.refined_pair_features": "collapsed:modules.denoiser",
          "value_sites.refined_single_features": "collapsed:modules.denoiser",
          "value_sites.sampler_step_coordinates": "collapsed:modules.directional_ddim_sampler_math",
          "value_sites.sequence_logits": "excluded",
          "value_sites.single_after_ipa": "collapsed:modules.denoiser",
          "value_sites.single_after_pair_attention": "collapsed:modules.denoiser",
          "value_sites.single_after_transition": "collapsed:modules.denoiser",
          "value_sites.single_with_global_tokens": "collapsed:modules.denoiser",
          "value_sites.step_coordinates": "visible",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "collapsed:modules.denoiser"
        },
        "projectionMode": "derived"
      },
      {
        "id": "directional_ddim_sampler_math",
        "title": "Fixed Directional DDIM Math",
        "summary": "This board exposes the non-learned part of one reverse step. It converts the model's cleaner-coordinate estimate into a denoising direction, selects fixed schedule coefficients, and optionally adds fresh Gaussian noise.",
        "parent": "reverse_diffusion_step",
        "subject_ref": "modules.directional_ddim_sampler_math",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "selected noise level",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 1,
            "row": 1
          },
          {
            "id": "step_coordinates",
            "ref": "value_sites.sampler_step_coordinates",
            "label": "current coordinates",
            "notation": "x_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "coordinate_prediction",
            "ref": "value_sites.coordinate_prediction",
            "label": "cleaner coordinate estimate",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "noise_readout",
            "ref": "modules.noise_readout",
            "label": "Compute denoising direction",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "predicted_noise",
            "ref": "value_sites.predicted_noise",
            "label": "denoising direction",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 3,
            "row": 2
          },
          {
            "id": "ddim_update",
            "ref": "modules.ddim_update",
            "label": "Combine schedule terms",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2
          },
          {
            "id": "next_coordinates",
            "ref": "value_sites.next_coordinates",
            "label": "next coordinates",
            "notation": "x_{t-10}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.step_coordinates",
            "reason": "The sampler-math-local coordinate occurrence is shown explicitly; the enclosing reverse-step handoff is visible on the parent board."
          },
          {
            "ref": "value_sites.fresh_step_noise",
            "reason": "The optional fresh Gaussian term is summarized by the fixed update; drawing its internal module-to-value-to-module loop would obscure the main formula."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.sampler_coordinates_enter_noise_readout"
            },
            "label": "x_t",
            "connection": {
              "title": "Current coordinate input",
              "role": "direction calculation",
              "inside": "The fixed readout retains the current coordinates for comparison with the model estimate."
            }
          },
          {
            "match": {
              "relation_ref": "relations.coordinate_prediction_enters_noise_readout"
            },
            "label": "x_hat",
            "connection": {
              "title": "Cleaner estimate input",
              "role": "direction calculation",
              "inside": "The fixed readout subtracts the cleaner estimate from the current coordinates."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_readout_produces_predicted_noise"
            },
            "label": "x_t - x_hat",
            "connection": {
              "title": "Denoising direction",
              "role": "fixed intermediate",
              "inside": "Coordinate subtraction produces the direction used by the DDIM update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.predicted_noise_enters_ddim_update"
            },
            "label": "direction",
            "connection": {
              "title": "Directional term",
              "role": "update input",
              "inside": "The update scales the denoising direction separately from the stochastic noise term."
            }
          },
          {
            "match": {
              "relation_ref": "relations.sampler_coordinates_enter_ddim_update"
            },
            "label": "current state",
            "route_side": "bottom",
            "route_clearance": 42,
            "connection": {
              "title": "Current-state term",
              "role": "update input",
              "inside": "The formula uses x_t directly when reconstructing the clean-coordinate estimate."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_enters_ddim_update"
            },
            "label": "coefficients",
            "tone": "conditioning",
            "route_side": "top",
            "route_clearance": 42,
            "connection": {
              "title": "Schedule coefficients",
              "role": "update control",
              "inside": "The selected reverse index chooses the fixed alpha and sigma coefficients."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ddim_update_produces_next_coordinates"
            },
            "label": "next state",
            "connection": {
              "title": "Updated coordinates",
              "role": "reverse-step output",
              "inside": "The reconstructed clean estimate, scaled direction, and optional Gaussian term produce the next point cloud."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_dfe4cd5721a0",
            "from": "coordinate_prediction",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.coordinate_prediction_enters_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.coordinate_prediction_enters_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "x_hat",
              "connection": {
                "title": "Cleaner estimate input",
                "role": "direction calculation",
                "inside": "The fixed readout subtracts the cleaner estimate from the current coordinates."
              }
            }
          },
          {
            "id": "projection_5d450cbd251a",
            "from": "ddim_update",
            "to": "next_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ddim_update_produces_next_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ddim_update_produces_next_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "next state",
              "connection": {
                "title": "Updated coordinates",
                "role": "reverse-step output",
                "inside": "The reconstructed clean estimate, scaled direction, and optional Gaussian term produce the next point cloud."
              }
            }
          },
          {
            "id": "projection_e8d268c4e6e0",
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
              "label": "x_t - x_hat",
              "connection": {
                "title": "Denoising direction",
                "role": "fixed intermediate",
                "inside": "Coordinate subtraction produces the direction used by the DDIM update."
              }
            }
          },
          {
            "id": "projection_58ff2aa7c10f",
            "from": "predicted_noise",
            "to": "ddim_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.predicted_noise_enters_ddim_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.predicted_noise_enters_ddim_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "direction",
              "connection": {
                "title": "Directional term",
                "role": "update input",
                "inside": "The update scales the denoising direction separately from the stochastic noise term."
              }
            }
          },
          {
            "id": "projection_4fdf3abb249b",
            "from": "step_coordinates",
            "to": "ddim_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.sampler_coordinates_enter_ddim_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.sampler_coordinates_enter_ddim_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "current state",
              "route_side": "bottom",
              "route_clearance": 42,
              "connection": {
                "title": "Current-state term",
                "role": "update input",
                "inside": "The formula uses x_t directly when reconstructing the clean-coordinate estimate."
              }
            }
          },
          {
            "id": "projection_1cbb011679f2",
            "from": "step_coordinates",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.sampler_coordinates_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.sampler_coordinates_enter_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current coordinate input",
                "role": "direction calculation",
                "inside": "The fixed readout retains the current coordinates for comparison with the model estimate."
              }
            }
          },
          {
            "id": "projection_6058fc899c92",
            "from": "timestep",
            "to": "ddim_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_enters_ddim_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_enters_ddim_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "coefficients",
              "tone": "conditioning",
              "route_side": "top",
              "route_clearance": 42,
              "connection": {
                "title": "Schedule coefficients",
                "role": "update control",
                "inside": "The selected reverse index chooses the fixed alpha and sigma coefficients."
              }
            }
          }
        ],
        "classifications": {
          "modules.ddim_update": "visible",
          "modules.noise_readout": "visible",
          "value_sites.coordinate_prediction": "visible",
          "value_sites.fresh_step_noise": "excluded",
          "value_sites.next_coordinates": "visible",
          "value_sites.predicted_noise": "visible",
          "value_sites.sampler_step_coordinates": "visible",
          "value_sites.step_coordinates": "excluded",
          "value_sites.timestep": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "denoiser_forward",
        "title": "V1 Denoiser Forward Path",
        "summary": "Task and timestep features form invariant single and pair states. A five-block transformer exchanges information in both directions, then an eight-layer equivariant decoder predicts coordinates while a parallel head emits optional sequence logits.",
        "parent": "reverse_diffusion_step",
        "subject_ref": "modules.denoiser",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 5,
          "column_sizing": "content",
          "row_sizing": "content",
          "col_gap": 36,
          "row_gap": 24
        },
        "lanes": [
          {
            "id": "single_stream",
            "label": "single representations",
            "kind": "representation",
            "row": 2,
            "representation_refs": [
              "representations.single_features",
              "representations.sequence_logits"
            ],
            "glyph": "single"
          },
          {
            "id": "pair_stream",
            "label": "pair representations",
            "kind": "representation",
            "row": 4,
            "representation_refs": [
              "representations.pair_features"
            ],
            "glyph": "pair"
          }
        ],
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "task features",
            "notation": "F",
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
            "col": 1,
            "row": 1
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "frames derived from x_t",
            "notation": "T_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 5
          },
          {
            "id": "single_feature_embedder",
            "ref": "modules.single_feature_embedder",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "pair_feature_embedder",
            "ref": "modules.pair_feature_embedder",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 4
          },
          {
            "id": "latent_transformer",
            "ref": "modules.latent_transformer",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "latent_transformer"
          },
          {
            "id": "refined_single_features",
            "ref": "value_sites.refined_single_features",
            "label": "mature singles",
            "notation": "s_out",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "mature pairs",
            "notation": "z_out",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 4,
            "row": 4
          },
          {
            "id": "structure_decoder",
            "ref": "modules.structure_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 3,
            "board_ref": "structure_decoder"
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.decoder_output_frames",
            "label": "updated token frames",
            "notation": "T_hat",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 5
          },
          {
            "id": "coordinate_prediction",
            "ref": "value_sites.coordinate_prediction",
            "label": "coordinate estimate",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 5
          },
          {
            "id": "sequence_head",
            "ref": "modules.sequence_head",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          },
          {
            "id": "sequence_logits",
            "ref": "value_sites.sequence_logits",
            "label": "optional amino-acid logits",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 2
          }
        ],
        "elide": [
          {
            "ref": "value_sites.initial_single_features"
          },
          {
            "ref": "value_sites.initial_pair_features"
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "This board starts from the already-derived current frames; Frenet construction belongs to the parent sampling-loop board."
          },
          {
            "ref": "modules.noise_readout",
            "reason": "Coordinate-noise subtraction belongs to the parent sampling-loop board; this board ends at the denoiser's coordinate estimate."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_embedder"
            },
            "label": "token + task metadata",
            "tone": "conditioning",
            "connection": {
              "title": "Single-feature inputs",
              "role": "invariant conditioning",
              "inside": "Token identity, chain, atom type, masks, known sequence, and task indicators are concatenated before projection."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_pair_embedder"
            },
            "label": "noisy geometry",
            "connection": {
              "title": "Current frame geometry",
              "role": "pair-feature input",
              "inside": "Pair distances and orientations are computed from frames derived from the current coordinate point cloud."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_pair_embedder"
            },
            "label": "known geometry",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioned geometry",
              "role": "pair-feature conditioning",
              "inside": "Motif groups, known structure frames, and relative chain information add task-dependent pair features."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_single_features_initialize_decoder_state"
            },
            "label": "mature singles",
            "connection": {
              "title": "Latent state to decoder",
              "role": "structural decoding input",
              "inside": "The five-block latent transformer removes global tokens and passes mature per-token features into equivariant decoding."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_frames_produce_coordinate_prediction"
            },
            "label": "updated translations",
            "connection": {
              "title": "Coordinate estimate",
              "role": "denoiser output",
              "inside": "The decoder exposes the translation component of its final updated frames."
            }
          },
          {
            "match": {
              "relation_ref": "relations.sequence_head_produces_logits"
            },
            "label": "20 residue types",
            "connection": {
              "title": "Optional sequence logits",
              "role": "auxiliary model output",
              "inside": "A parallel MLP maps mature single features to categorical amino-acid scores."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_8617456721d2",
            "from": "current_frames",
            "to": "pair_feature_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_pair_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_pair_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
              "label": "noisy geometry",
              "connection": {
                "title": "Current frame geometry",
                "role": "pair-feature input",
                "inside": "Pair distances and orientations are computed from frames derived from the current coordinate point cloud."
              }
            }
          },
          {
            "id": "projection_b2e21d590345",
            "from": "current_frames",
            "to": "structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_initialize_decoder_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_initialize_decoder_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f8c564c15031",
            "from": "feature_bundle",
            "to": "pair_feature_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_pair_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_pair_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "known geometry",
              "tone": "conditioning",
              "connection": {
                "title": "Conditioned geometry",
                "role": "pair-feature conditioning",
                "inside": "Motif groups, known structure frames, and relative chain information add task-dependent pair features."
              }
            }
          },
          {
            "id": "projection_afe4984a225d",
            "from": "feature_bundle",
            "to": "single_feature_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "token + task metadata",
              "tone": "conditioning",
              "connection": {
                "title": "Single-feature inputs",
                "role": "invariant conditioning",
                "inside": "Token identity, chain, atom type, masks, known sequence, and task indicators are concatenated before projection."
              }
            }
          },
          {
            "id": "projection_30e9735342cf",
            "from": "feature_bundle",
            "to": "structure_decoder",
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
            "id": "projection_5750bbfb9ba1",
            "from": "latent_transformer",
            "to": "refined_pair_features",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_pair_output_becomes_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_output_becomes_refined_pair_features"
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
            "id": "projection_73e0a465c195",
            "from": "latent_transformer",
            "to": "refined_single_features",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_single_output_becomes_refined_single_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_output_becomes_refined_single_features"
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
            "id": "projection_c68389374239",
            "from": "pair_feature_embedder",
            "to": "latent_transformer",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_embedder_produces_initial_pair_features",
              "relations.initial_pair_features_enter_global_adapter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_embedder_produces_initial_pair_features"
              },
              {
                "relation_ref": "relations.initial_pair_features_enter_global_adapter"
              }
            ],
            "hidden_refs": [
              "value_sites.initial_pair_features"
            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_3766d538c25b",
            "from": "refined_pair_features",
            "to": "structure_decoder",
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
            }
          },
          {
            "id": "projection_34ec5ca69023",
            "from": "refined_single_features",
            "to": "sequence_head",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.refined_single_features_enter_sequence_head"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_single_features_enter_sequence_head"
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
            "id": "projection_57e1a910dcf8",
            "from": "refined_single_features",
            "to": "structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.refined_single_features_initialize_decoder_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_single_features_initialize_decoder_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "mature singles",
              "connection": {
                "title": "Latent state to decoder",
                "role": "structural decoding input",
                "inside": "The five-block latent transformer removes global tokens and passes mature per-token features into equivariant decoding."
              }
            }
          },
          {
            "id": "projection_28c502bba586",
            "from": "sequence_head",
            "to": "sequence_logits",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.sequence_head_produces_logits"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.sequence_head_produces_logits"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sequence_logits"
            ],
            "presentation": {
              "label": "20 residue types",
              "connection": {
                "title": "Optional sequence logits",
                "role": "auxiliary model output",
                "inside": "A parallel MLP maps mature single features to categorical amino-acid scores."
              }
            }
          },
          {
            "id": "projection_93930ba0cad5",
            "from": "single_feature_embedder",
            "to": "latent_transformer",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_embedder_produces_initial_single_features",
              "relations.initial_single_features_enter_global_adapter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_embedder_produces_initial_single_features"
              },
              {
                "relation_ref": "relations.initial_single_features_enter_global_adapter"
              }
            ],
            "hidden_refs": [
              "value_sites.initial_single_features"
            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_04423d70e07a",
            "from": "single_feature_embedder",
            "to": "pair_feature_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_embedder_produces_initial_single_features",
              "relations.initial_single_features_enter_pair_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_embedder_produces_initial_single_features"
              },
              {
                "relation_ref": "relations.initial_single_features_enter_pair_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.initial_single_features"
            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_3de50b35db7d",
            "from": "structure_decoder",
            "to": "updated_frames",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.updated_frames_become_decoder_output_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_become_decoder_output_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a8946ce7c53f",
            "from": "timestep",
            "to": "single_feature_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_embedder"
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
            "id": "projection_11c65f7ec586",
            "from": "updated_frames",
            "to": "coordinate_prediction",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.updated_frames_produce_coordinate_prediction"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_produce_coordinate_prediction"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_coordinates"
            ],
            "presentation": {
              "label": "updated translations",
              "connection": {
                "title": "Coordinate estimate",
                "role": "denoiser output",
                "inside": "The decoder exposes the translation component of its final updated frames."
              }
            }
          }
        ],
        "classifications": {
          "modules.frame_update": "collapsed:modules.structure_decoder",
          "modules.frenet_frame_builder": "excluded",
          "modules.global_token_adapter": "collapsed:modules.latent_transformer",
          "modules.invariant_point_attention": "collapsed:modules.structure_decoder",
          "modules.latent_transformer": "visible",
          "modules.noise_readout": "excluded",
          "modules.pair_biased_attention_update": "collapsed:modules.latent_transformer",
          "modules.pair_feature_embedder": "visible",
          "modules.pair_transition": "collapsed:modules.latent_transformer",
          "modules.sequence_head": "visible",
          "modules.single_feature_embedder": "visible",
          "modules.single_to_pair_update": "collapsed:modules.latent_transformer",
          "modules.structure_decoder": "visible",
          "modules.structure_transition": "collapsed:modules.structure_decoder",
          "modules.triangle_multiplication_stack": "collapsed:modules.latent_transformer",
          "value_sites.coordinate_prediction": "visible",
          "value_sites.current_frames": "visible",
          "value_sites.decoder_frames": "collapsed:modules.structure_decoder",
          "value_sites.decoder_output_frames": "visible",
          "value_sites.decoder_single_state": "collapsed:modules.structure_decoder",
          "value_sites.feature_bundle": "visible",
          "value_sites.initial_pair_features": "elided",
          "value_sites.initial_single_features": "elided",
          "value_sites.pair_after_single_update": "collapsed:modules.latent_transformer",
          "value_sites.pair_after_transition": "collapsed:modules.latent_transformer",
          "value_sites.pair_after_triangle_updates": "collapsed:modules.latent_transformer",
          "value_sites.pair_with_global_tokens": "collapsed:modules.latent_transformer",
          "value_sites.refined_pair_features": "visible",
          "value_sites.refined_single_features": "visible",
          "value_sites.sequence_logits": "visible",
          "value_sites.single_after_ipa": "collapsed:modules.structure_decoder",
          "value_sites.single_after_pair_attention": "collapsed:modules.latent_transformer",
          "value_sites.single_after_transition": "collapsed:modules.structure_decoder",
          "value_sites.single_with_global_tokens": "collapsed:modules.latent_transformer",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "collapsed:modules.structure_decoder"
        },
        "projectionMode": "derived"
      },
      {
        "id": "latent_transformer",
        "title": "Five-Block Bidirectional Latent Transformer",
        "summary": "Ten global tokens are appended once. The repeated region shows one block, where pairs update singles through pair-biased attention, the updated singles feed pairs through an outer product, and triangle plus transition operations update the pair state. The block outputs become the next block inputs; after block five, global entries are removed to form the mature outputs.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.latent_transformer",
        "expansion_depth": 1,
        "grid": {
          "columns": 11,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 24
        },
        "regions": [
          {
            "id": "latent_block_iteration",
            "kind": "repeat",
            "execution_ref": "execution.loops.latent_reasoning_stack",
            "label": "one latent block",
            "node_ids": [
              "single_with_global_tokens",
              "pair_with_global_tokens",
              "pair_biased_attention_update",
              "single_after_pair_attention",
              "single_to_pair_update",
              "pair_after_single_update",
              "triangle_multiplication_stack",
              "pair_after_triangle_updates",
              "pair_transition",
              "pair_after_transition"
            ],
            "iteration_relation_refs": [
              "relations.block_single_output_reenters_next_latent_block",
              "relations.block_pair_output_reenters_next_latent_block"
            ]
          }
        ],
        "nodes": [
          {
            "id": "initial_single_features",
            "ref": "value_sites.initial_single_features",
            "label": "initial singles",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "initial_pair_features",
            "ref": "value_sites.initial_pair_features",
            "label": "initial pairs",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 4
          },
          {
            "id": "global_token_adapter",
            "ref": "modules.global_token_adapter",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "single_with_global_tokens",
            "ref": "value_sites.single_with_global_tokens",
            "label": "block-input singles + globals",
            "notation": "s_i",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "pair_with_global_tokens",
            "ref": "value_sites.pair_with_global_tokens",
            "label": "block-input pairs + globals",
            "notation": "z_i",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 3,
            "row": 4
          },
          {
            "id": "pair_biased_attention_update",
            "ref": "modules.pair_biased_attention_update",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "genie3_reduced_pair_attention_internals"
          },
          {
            "id": "single_after_pair_attention",
            "ref": "value_sites.single_after_pair_attention",
            "label": "next-block singles",
            "notation": "s_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "single_to_pair_update",
            "ref": "modules.single_to_pair_update",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "pair_after_single_update",
            "ref": "value_sites.pair_after_single_update",
            "label": "single-updated pairs",
            "notation": "z_prime",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 6,
            "row": 4
          },
          {
            "id": "triangle_multiplication_stack",
            "ref": "modules.triangle_multiplication_stack",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4
          },
          {
            "id": "pair_after_triangle_updates",
            "ref": "value_sites.pair_after_triangle_updates",
            "label": "triangle-updated pairs",
            "notation": "z_tri",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 8,
            "row": 4
          },
          {
            "id": "pair_transition",
            "ref": "modules.pair_transition",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 9,
            "row": 4
          },
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "next-block pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 10,
            "row": 4
          },
          {
            "id": "refined_single_features",
            "ref": "value_sites.refined_single_features",
            "label": "mature singles",
            "notation": "s_out",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "mature pairs",
            "notation": "z_out",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 11,
            "row": 4
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.pair_with_global_tokens_bias_attention"
            },
            "label": "pair bias + values",
            "tone": "conditioning",
            "connection": {
              "title": "Pairs update singles",
              "role": "pair-to-single communication",
              "inside": "Pair features bias self-attention and also contribute projected values to the single residual stream."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_after_pair_attention_enters_single_to_pair_update"
            },
            "label": "outer product",
            "connection": {
              "title": "Singles update pairs",
              "role": "single-to-pair communication",
              "inside": "Projected updated singles form an outer product that is added to the pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.triangle_stack_produces_pair_state"
            },
            "label": "outgoing + incoming",
            "connection": {
              "title": "Triangular pair reasoning",
              "role": "pair refinement",
              "inside": "Outgoing and incoming triangular multiplication propagate information around three-token paths before the pair MLP."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_c7f5b87b6b4f",
            "from": "global_token_adapter",
            "to": "pair_with_global_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.global_adapter_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.global_adapter_produces_pair_state"
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
            "id": "projection_b456f42fcf82",
            "from": "global_token_adapter",
            "to": "single_with_global_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.global_adapter_produces_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.global_adapter_produces_single_state"
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
            "id": "projection_dbfc26f83475",
            "from": "initial_pair_features",
            "to": "global_token_adapter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_features_enter_global_adapter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_features_enter_global_adapter"
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
            "id": "projection_0ca8f8cb557f",
            "from": "initial_single_features",
            "to": "global_token_adapter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_single_features_enter_global_adapter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_single_features_enter_global_adapter"
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
            "id": "projection_f36b8072189a",
            "from": "pair_after_single_update",
            "to": "triangle_multiplication_stack",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_after_single_update_enters_triangle_stack"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_after_single_update_enters_triangle_stack"
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
            "id": "projection_9cae0bd08deb",
            "from": "pair_after_transition",
            "to": "pair_with_global_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_pair_output_reenters_next_latent_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_output_reenters_next_latent_block"
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
            "id": "projection_a62c21b61028",
            "from": "pair_after_transition",
            "to": "refined_pair_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_pair_output_becomes_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_output_becomes_refined_pair_features"
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
            "id": "projection_67fc06360f07",
            "from": "pair_after_triangle_updates",
            "to": "pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_after_triangle_updates_enter_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_after_triangle_updates_enter_transition"
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
            "id": "projection_e79c6de090ae",
            "from": "pair_biased_attention_update",
            "to": "single_after_pair_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_attention_produces_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_attention_produces_single_state"
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
            "id": "projection_8c948afbc236",
            "from": "pair_transition",
            "to": "pair_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_produces_block_pair_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_produces_block_pair_output"
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
            "id": "projection_0a454bdfebee",
            "from": "pair_with_global_tokens",
            "to": "pair_biased_attention_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_with_global_tokens_bias_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_with_global_tokens_bias_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "pair bias + values",
              "tone": "conditioning",
              "connection": {
                "title": "Pairs update singles",
                "role": "pair-to-single communication",
                "inside": "Pair features bias self-attention and also contribute projected values to the single residual stream."
              }
            }
          },
          {
            "id": "projection_06bd2ed5d31d",
            "from": "pair_with_global_tokens",
            "to": "single_to_pair_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_with_global_tokens_enters_single_to_pair_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_with_global_tokens_enters_single_to_pair_update"
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
            "id": "projection_add6fbfbdc4c",
            "from": "single_after_pair_attention",
            "to": "refined_single_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_single_output_becomes_refined_single_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_output_becomes_refined_single_features"
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
            "id": "projection_48d272b07aa3",
            "from": "single_after_pair_attention",
            "to": "single_to_pair_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_after_pair_attention_enters_single_to_pair_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_after_pair_attention_enters_single_to_pair_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "outer product",
              "connection": {
                "title": "Singles update pairs",
                "role": "single-to-pair communication",
                "inside": "Projected updated singles form an outer product that is added to the pair state."
              }
            }
          },
          {
            "id": "projection_218279fbbaa7",
            "from": "single_after_pair_attention",
            "to": "single_with_global_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_single_output_reenters_next_latent_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_output_reenters_next_latent_block"
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
            "id": "projection_162a900ee1ac",
            "from": "single_to_pair_update",
            "to": "pair_after_single_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_to_pair_update_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_to_pair_update_produces_pair_state"
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
            "id": "projection_92dbab50c8f3",
            "from": "single_with_global_tokens",
            "to": "pair_biased_attention_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_with_global_tokens_enters_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_with_global_tokens_enters_attention"
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
            "id": "projection_d09b81537023",
            "from": "triangle_multiplication_stack",
            "to": "pair_after_triangle_updates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.triangle_stack_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.triangle_stack_produces_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "outgoing + incoming",
              "connection": {
                "title": "Triangular pair reasoning",
                "role": "pair refinement",
                "inside": "Outgoing and incoming triangular multiplication propagate information around three-token paths before the pair MLP."
              }
            }
          }
        ],
        "classifications": {
          "modules.global_token_adapter": "visible",
          "modules.pair_biased_attention_update": "visible",
          "modules.pair_transition": "visible",
          "modules.single_to_pair_update": "visible",
          "modules.triangle_multiplication_stack": "visible",
          "value_sites.initial_pair_features": "visible",
          "value_sites.initial_single_features": "visible",
          "value_sites.pair_after_single_update": "visible",
          "value_sites.pair_after_transition": "visible",
          "value_sites.pair_after_triangle_updates": "visible",
          "value_sites.pair_with_global_tokens": "visible",
          "value_sites.refined_pair_features": "visible",
          "value_sites.refined_single_features": "visible",
          "value_sites.single_after_pair_attention": "visible",
          "value_sites.single_with_global_tokens": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "structure_decoder",
        "title": "Eight-Layer Equivariant Structure Decoder",
        "summary": "Full IPA uses mature single and pair features plus current frames. A transition updates the invariant state, then a rigid increment moves every valid token frame; the updated state repeats for eight layers.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.structure_decoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 8,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 32
        },
        "regions": [
          {
            "id": "structure_layer_iteration",
            "kind": "repeat",
            "execution_ref": "execution.loops.structure_refinement_stack",
            "label": "one structure layer",
            "node_ids": [
              "decoder_single_state",
              "refined_pair_features",
              "decoder_frames",
              "invariant_point_attention",
              "single_after_ipa",
              "structure_transition",
              "single_after_transition",
              "frame_update",
              "updated_frames"
            ],
            "iteration_relation_refs": [
              "relations.transition_state_reenters_decoder",
              "relations.updated_frames_reenter_decoder"
            ]
          }
        ],
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "valid-frame mask",
            "notation": "M",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 1,
            "row": 1
          },
          {
            "id": "decoder_single_state",
            "ref": "value_sites.decoder_single_state",
            "label": "decoder single state",
            "notation": "s_l",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "mature pair state",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 3
          },
          {
            "id": "decoder_frames",
            "ref": "value_sites.decoder_frames",
            "label": "current decoder frames",
            "notation": "T_l",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "invariant_point_attention",
            "ref": "modules.invariant_point_attention",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "genie3_ipa_internals"
          },
          {
            "id": "single_after_ipa",
            "ref": "value_sites.single_after_ipa",
            "label": "attention-updated singles",
            "notation": "s_attn",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "structure_transition",
            "ref": "modules.structure_transition",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "transitioned singles",
            "notation": "s_{l+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "frame_update",
            "ref": "modules.frame_update",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 4
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.updated_frames",
            "label": "updated token frames",
            "notation": "T_{l+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4
          },
          {
            "id": "decoder_output_frames",
            "ref": "value_sites.decoder_output_frames",
            "label": "final decoder frames",
            "notation": "T_hat",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.current_frames",
            "reason": "The board uses the explicit per-layer decoder-frame state initialized from the denoiser's current frames."
          },
          {
            "ref": "value_sites.refined_single_features",
            "reason": "The explicit decoder single-state site represents the initialized and recurrent structure-layer state."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.refined_pair_features_bias_ipa"
            },
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "Pair-conditioned IPA",
              "role": "invariant relational context",
              "inside": "Mature pair features contribute an attention bias while frame-transformed query, key, and value points carry equivariant geometry."
            }
          },
          {
            "match": {
              "relation_ref": "relations.decoder_frames_condition_ipa"
            },
            "label": "frame points",
            "tone": "conditioning",
            "connection": {
              "title": "Frame-aware point attention",
              "role": "equivariant geometric context",
              "inside": "Query, key, and value points are expressed in the current token frames so global rigid motions preserve the update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.transition_state_enters_frame_update"
            },
            "label": "rigid increment",
            "connection": {
              "title": "Learned frame motion",
              "role": "structure update",
              "inside": "The transitioned single state is projected to a six-parameter rigid increment for each valid token."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_frames_become_decoder_output_frames"
            },
            "label": "after layer 8",
            "connection": {
              "title": "Final decoder frames",
              "role": "decoder output",
              "inside": "The eighth layer's updated frame state leaves the repeated decoder as the final frame estimate; coordinate readout happens on the parent board."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_c27a6988ec3f",
            "from": "decoder_frames",
            "to": "frame_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.decoder_frames_enter_frame_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.decoder_frames_enter_frame_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_09522ef9e305",
            "from": "decoder_frames",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.decoder_frames_condition_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.decoder_frames_condition_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
              "label": "frame points",
              "tone": "conditioning",
              "connection": {
                "title": "Frame-aware point attention",
                "role": "equivariant geometric context",
                "inside": "Query, key, and value points are expressed in the current token frames so global rigid motions preserve the update."
              }
            }
          },
          {
            "id": "projection_272296514381",
            "from": "decoder_single_state",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.decoder_single_state_enters_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.decoder_single_state_enters_ipa"
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
            "id": "projection_c98036bbf37b",
            "from": "frame_update",
            "to": "updated_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.frame_update_produces_updated_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.frame_update_produces_updated_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
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
              "label": "pair bias",
              "tone": "conditioning",
              "connection": {
                "title": "Pair-conditioned IPA",
                "role": "invariant relational context",
                "inside": "Mature pair features contribute an attention bias while frame-transformed query, key, and value points carry equivariant geometry."
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
            "id": "projection_91f79a01c402",
            "from": "single_after_transition",
            "to": "decoder_single_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.transition_state_reenters_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.transition_state_reenters_decoder"
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
            "id": "projection_776d95717f8f",
            "from": "single_after_transition",
            "to": "frame_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.transition_state_enters_frame_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.transition_state_enters_frame_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "rigid increment",
              "connection": {
                "title": "Learned frame motion",
                "role": "structure update",
                "inside": "The transitioned single state is projected to a six-parameter rigid increment for each valid token."
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
            }
          },
          {
            "id": "projection_e6e037484cef",
            "from": "updated_frames",
            "to": "decoder_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.updated_frames_reenter_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_reenter_decoder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_d75b76a327c4",
            "from": "updated_frames",
            "to": "decoder_output_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.updated_frames_become_decoder_output_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_become_decoder_output_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_frames"
            ],
            "presentation": {
              "label": "after layer 8",
              "connection": {
                "title": "Final decoder frames",
                "role": "decoder output",
                "inside": "The eighth layer's updated frame state leaves the repeated decoder as the final frame estimate; coordinate readout happens on the parent board."
              }
            }
          }
        ],
        "classifications": {
          "modules.frame_update": "visible",
          "modules.invariant_point_attention": "visible",
          "modules.structure_transition": "visible",
          "value_sites.current_frames": "excluded",
          "value_sites.decoder_frames": "visible",
          "value_sites.decoder_output_frames": "visible",
          "value_sites.decoder_single_state": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.refined_pair_features": "visible",
          "value_sites.refined_single_features": "excluded",
          "value_sites.single_after_ipa": "visible",
          "value_sites.single_after_transition": "visible",
          "value_sites.updated_frames": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "genie3_reduced_pair_attention_internals",
        "kind": "standard_block_instance",
        "title": "Genie 3 Reduced Pair Attention Internals",
        "summary": "This reduced variant keeps scalar attention, pair-logit bias, and pair-value aggregation, while omitting frame-aware point terms and applying the latent-block wrapper.",
        "parent": "latent_transformer",
        "subject_ref": "modules.pair_biased_attention_update",
        "expansion_depth": 0,
        "block_instance_ref": "block_instances.latent_reduced_pair_attention",
        "grid": {
          "columns": 9,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 28,
          "row_gap": 24
        },
        "nodes": [
          {
            "id": "single_state",
            "label": "single state",
            "role": "state used to form queries, keys, and scalar values",
            "col": 1,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.single_state",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.ports.single_state",
            "kind": "representation",
            "rep_ref": "single_features",
            "shape": "B x N x 384",
            "scale": "token",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s",
            "port_ref": "ports.single_state"
          },
          {
            "id": "pair_context",
            "label": "pair context",
            "role": "read-only pair representation used for logit bias and optional pair values",
            "col": 1,
            "row": 5,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.pair_context",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.ports.pair_context",
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
            "id": "attention_mask",
            "label": "attention mask",
            "role": "optional validity mask applied before softmax and after a reduced wrapper",
            "col": 3,
            "row": 6,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.attention_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.ports.attention_mask",
            "kind": "representation",
            "scale": "item",
            "glyph": "vector",
            "notation": "m",
            "port_ref": "ports.attention_mask"
          },
          {
            "id": "updated_single_state",
            "label": "updated single state",
            "role": "attention-updated single/token stream",
            "col": 9,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.updated_single_state",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.ports.updated_single_state",
            "kind": "representation",
            "rep_ref": "single_features",
            "shape": "B x N x 384",
            "scale": "token",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s'",
            "port_ref": "ports.updated_single_state"
          },
          {
            "id": "project_qkv",
            "label": "Project Q, K, and V",
            "role": "form self-attention terms from the same single-state input",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "kind": "operation",
            "scale": "operation",
            "detail": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "operation": "qkv_projection"
          },
          {
            "id": "queries",
            "label": "queries",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.queries",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.queries",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "Q"
          },
          {
            "id": "keys",
            "label": "keys",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.keys",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.keys",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "K"
          },
          {
            "id": "scalar_values",
            "label": "scalar values",
            "col": 3,
            "row": 3,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.scalar_values",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "V"
          },
          {
            "id": "scalar_logits_step",
            "label": "Form query-key logits",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "operation": "attention_logits"
          },
          {
            "id": "scalar_logits",
            "label": "query-key logits",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.scalar_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l_qk"
          },
          {
            "id": "project_pair_bias",
            "label": "Project pair bias",
            "role": "the selected architecture variant owns any pair preprocessing before projection",
            "col": 3,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "operation": "pair_bias_projection"
          },
          {
            "id": "pair_bias",
            "label": "projected pair bias",
            "col": 5,
            "row": 5,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.pair_bias",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.pair_bias",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "b_z"
          },
          {
            "id": "combine_logits",
            "label": "Add pair bias",
            "col": 6,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "operation": "pair_bias_add"
          },
          {
            "id": "biased_logits",
            "label": "conditioned logits",
            "col": 7,
            "row": 3,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.biased_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.biased_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l"
          },
          {
            "id": "apply_attention_mask",
            "label": "Apply attention mask",
            "col": 5,
            "row": 6,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "kind": "operation",
            "scale": "operation",
            "detail": "attention_mask",
            "code": "masked_logits = biased_logits + mask_bias(attention_mask)",
            "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}",
            "operation": "attention_mask"
          },
          {
            "id": "masked_logits",
            "label": "masked logits",
            "col": 7,
            "row": 6,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.masked_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.masked_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l_m"
          },
          {
            "id": "softmax_attention_masked",
            "label": "Normalize masked attention",
            "col": 8,
            "row": 6,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
            "kind": "operation",
            "scale": "operation",
            "detail": "softmax",
            "code": "attention = softmax(masked_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell^m_{ijh})",
            "operation": "softmax"
          },
          {
            "id": "attention_weights",
            "label": "attention weights",
            "col": 9,
            "row": 3,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.attention_weights",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.attention_weights",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "a"
          },
          {
            "id": "aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "col": 6,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "kind": "operation",
            "scale": "operation",
            "detail": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "operation": "weighted_sum"
          },
          {
            "id": "scalar_context",
            "label": "scalar context",
            "col": 7,
            "row": 1,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_context",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.scalar_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "o_s"
          },
          {
            "id": "aggregate_pair_values",
            "label": "Aggregate pair values",
            "col": 6,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_value_aggregation",
            "code": "pair_context_out = einsum(attention, pair_context)",
            "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}",
            "operation": "pair_value_aggregation"
          },
          {
            "id": "pair_value_context",
            "label": "pair-value context",
            "col": 7,
            "row": 5,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.pair_value_context",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.pair_value_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "o_z"
          },
          {
            "id": "project_reduced_output",
            "label": "Fuse scalar and pair contexts",
            "col": 8,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "kind": "operation",
            "scale": "operation",
            "detail": "output_projection",
            "code": "attention_delta = output_projection(concat(scalar_context, pair_context_out))",
            "operation": "output_projection"
          },
          {
            "id": "attention_delta",
            "label": "attention delta",
            "col": 9,
            "row": 5,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.attention_delta",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.attention_delta",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "delta_s"
          },
          {
            "id": "residual_norm",
            "label": "Residual, dropout, and norm",
            "col": 7,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "kind": "operation",
            "scale": "operation",
            "detail": "residual_normalization",
            "code": "normalized_single = layer_norm(single_state + dropout(attention_delta))",
            "operation": "residual_normalization"
          },
          {
            "id": "normalized_single",
            "label": "residual-normalized state",
            "col": 8,
            "row": 4,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.normalized_single",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.values.normalized_single",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s_norm"
          },
          {
            "id": "transition_and_mask",
            "label": "Transition and mask",
            "col": 9,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "kind": "operation",
            "scale": "operation",
            "detail": "transition_mask",
            "code": "updated_single_state = transition(normalized_single) * attention_mask",
            "operation": "transition_mask"
          }
        ],
        "edges": [
          {
            "id": "latent_reduced_pair_attention__project_qkv__input_1",
            "from": "single_state",
            "to": "project_qkv",
            "kind": "data_flow",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.single_with_global_tokens_enters_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step input",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_qkv__output_1",
            "from": "project_qkv",
            "to": "queries",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "template_data_ref": "values.queries",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_qkv__output_2",
            "from": "project_qkv",
            "to": "keys",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "template_data_ref": "values.keys",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_qkv__output_3",
            "from": "project_qkv",
            "to": "scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "template_data_ref": "values.scalar_values",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__scalar_logits__input_1",
            "from": "queries",
            "to": "scalar_logits_step",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.queries",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step input",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "latent_reduced_pair_attention__scalar_logits__input_2",
            "from": "keys",
            "to": "scalar_logits_step",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.keys",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step input",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "latent_reduced_pair_attention__scalar_logits__output_1",
            "from": "scalar_logits_step",
            "to": "scalar_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step output",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_pair_bias__input_1",
            "from": "pair_context",
            "to": "project_pair_bias",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.pair_features"
            ],
            "relation_path": [
              "relations.pair_with_global_tokens_bias_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
            "template_data_ref": "ports.pair_context",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step input",
              "inside": "pair_bias = project_pair(pair_context)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_pair_bias__output_1",
            "from": "project_pair_bias",
            "to": "pair_bias",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step output",
              "inside": "pair_bias = project_pair(pair_context)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__combine_logits__input_1",
            "from": "scalar_logits",
            "to": "combine_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step input",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "latent_reduced_pair_attention__combine_logits__input_2",
            "from": "pair_bias",
            "to": "combine_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step input",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "latent_reduced_pair_attention__combine_logits__output_1",
            "from": "combine_logits",
            "to": "biased_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "template_data_ref": "values.biased_logits",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step output",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "latent_reduced_pair_attention__apply_attention_mask__input_1",
            "from": "biased_logits",
            "to": "apply_attention_mask",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "template_data_ref": "values.biased_logits",
            "connection": {
              "title": "Apply attention mask",
              "role": "reusable step input",
              "inside": "masked_logits = biased_logits + mask_bias(attention_mask)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__apply_attention_mask__input_2",
            "from": "attention_mask",
            "to": "apply_attention_mask",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "template_data_ref": "ports.attention_mask",
            "connection": {
              "title": "Apply attention mask",
              "role": "reusable step input",
              "inside": "masked_logits = biased_logits + mask_bias(attention_mask)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__apply_attention_mask__output_1",
            "from": "apply_attention_mask",
            "to": "masked_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "template_data_ref": "values.masked_logits",
            "connection": {
              "title": "Apply attention mask",
              "role": "reusable step output",
              "inside": "masked_logits = biased_logits + mask_bias(attention_mask)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__softmax_attention_masked__input_1",
            "from": "masked_logits",
            "to": "softmax_attention_masked",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
            "template_data_ref": "values.masked_logits",
            "connection": {
              "title": "Normalize masked attention",
              "role": "reusable step input",
              "inside": "attention = softmax(masked_logits, dim=keys)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__softmax_attention_masked__output_1",
            "from": "softmax_attention_masked",
            "to": "attention_weights",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Normalize masked attention",
              "role": "reusable step output",
              "inside": "attention = softmax(masked_logits, dim=keys)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_scalar_values__input_1",
            "from": "attention_weights",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_scalar_values__input_2",
            "from": "scalar_values",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_values",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_scalar_values__output_1",
            "from": "aggregate_scalar_values",
            "to": "scalar_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step output",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_pair_values__input_1",
            "from": "attention_weights",
            "to": "aggregate_pair_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step input",
              "inside": "pair_context_out = einsum(attention, pair_context)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_pair_values__input_2",
            "from": "pair_context",
            "to": "aggregate_pair_values",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.pair_features"
            ],
            "relation_path": [
              "relations.pair_with_global_tokens_bias_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "template_data_ref": "ports.pair_context",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step input",
              "inside": "pair_context_out = einsum(attention, pair_context)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__aggregate_pair_values__output_1",
            "from": "aggregate_pair_values",
            "to": "pair_value_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "template_data_ref": "values.pair_value_context",
            "connection": {
              "title": "Aggregate pair values",
              "role": "reusable step output",
              "inside": "pair_context_out = einsum(attention, pair_context)"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_reduced_output__input_1",
            "from": "scalar_context",
            "to": "project_reduced_output",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Fuse scalar and pair contexts",
              "role": "reusable step input",
              "inside": "attention_delta = output_projection(concat(scalar_context, pair_context_out))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_reduced_output__input_2",
            "from": "pair_value_context",
            "to": "project_reduced_output",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "template_data_ref": "values.pair_value_context",
            "connection": {
              "title": "Fuse scalar and pair contexts",
              "role": "reusable step input",
              "inside": "attention_delta = output_projection(concat(scalar_context, pair_context_out))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__project_reduced_output__output_1",
            "from": "project_reduced_output",
            "to": "attention_delta",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "template_data_ref": "values.attention_delta",
            "connection": {
              "title": "Fuse scalar and pair contexts",
              "role": "reusable step output",
              "inside": "attention_delta = output_projection(concat(scalar_context, pair_context_out))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__residual_norm__input_1",
            "from": "single_state",
            "to": "residual_norm",
            "kind": "data_flow",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.single_with_global_tokens_enters_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step input",
              "inside": "normalized_single = layer_norm(single_state + dropout(attention_delta))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__residual_norm__input_2",
            "from": "attention_delta",
            "to": "residual_norm",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "template_data_ref": "values.attention_delta",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step input",
              "inside": "normalized_single = layer_norm(single_state + dropout(attention_delta))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__residual_norm__output_1",
            "from": "residual_norm",
            "to": "normalized_single",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "template_data_ref": "values.normalized_single",
            "connection": {
              "title": "Residual, dropout, and norm",
              "role": "reusable step output",
              "inside": "normalized_single = layer_norm(single_state + dropout(attention_delta))"
            }
          },
          {
            "id": "latent_reduced_pair_attention__transition_and_mask__input_1",
            "from": "normalized_single",
            "to": "transition_and_mask",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "template_data_ref": "values.normalized_single",
            "connection": {
              "title": "Transition and mask",
              "role": "reusable step input",
              "inside": "updated_single_state = transition(normalized_single) * attention_mask"
            }
          },
          {
            "id": "latent_reduced_pair_attention__transition_and_mask__input_2",
            "from": "attention_mask",
            "to": "transition_and_mask",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "template_data_ref": "ports.attention_mask",
            "connection": {
              "title": "Transition and mask",
              "role": "reusable step input",
              "inside": "updated_single_state = transition(normalized_single) * attention_mask"
            }
          },
          {
            "id": "latent_reduced_pair_attention__transition_and_mask__output_1",
            "from": "transition_and_mask",
            "to": "updated_single_state",
            "kind": "state_update",
            "carries": [
              "representations.single_features"
            ],
            "relation_path": [
              "relations.pair_attention_produces_single_state"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.latent_reduced_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instance_fact_ref": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "template_data_ref": "ports.updated_single_state",
            "connection": {
              "title": "Transition and mask",
              "role": "reusable step output",
              "inside": "updated_single_state = transition(normalized_single) * attention_mask"
            }
          }
        ],
        "projectionMode": "standard_block_template",
        "standardBlockRef": "standard_blocks/pair-biased-attention.yaml",
        "standardBlockId": "pair_biased_attention",
        "blockInstanceRef": "block_instances.latent_reduced_pair_attention",
        "variant": "pair_values_residual_norm_transition",
        "variantLabel": "Reduced pair attention + wrapper",
        "useScope": "whole_module",
        "conformance": "reduced",
        "differenceSummary": "Genie 3 removes frame-aware point terms, keeps pair-logit bias and pair-value aggregation, then adds residual normalization, a single transition, and final masking.",
        "pseudocode": [
          {
            "id": "project_qkv",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
            "label": "Project Q, K, and V",
            "operation": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.queries",
              "values.keys",
              "values.scalar_values"
            ]
          },
          {
            "id": "scalar_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
            "label": "Form query-key logits",
            "operation": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "inputs": [
              "values.queries",
              "values.keys"
            ],
            "outputs": [
              "values.scalar_logits"
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ]
          },
          {
            "id": "combine_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
            "label": "Add pair bias",
            "operation": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "inputs": [
              "values.scalar_logits",
              "values.pair_bias"
            ],
            "outputs": [
              "values.biased_logits"
            ]
          },
          {
            "id": "apply_attention_mask",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
            "label": "Apply attention mask",
            "operation": "attention_mask",
            "code": "masked_logits = biased_logits + mask_bias(attention_mask)",
            "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}",
            "inputs": [
              "values.biased_logits",
              "ports.attention_mask"
            ],
            "outputs": [
              "values.masked_logits"
            ]
          },
          {
            "id": "softmax_attention_masked",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
            "label": "Normalize masked attention",
            "operation": "softmax",
            "code": "attention = softmax(masked_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell^m_{ijh})",
            "inputs": [
              "values.masked_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "inputs": [
              "values.attention_weights",
              "values.scalar_values"
            ],
            "outputs": [
              "values.scalar_context"
            ]
          },
          {
            "id": "aggregate_pair_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
            "label": "Aggregate pair values",
            "operation": "pair_value_aggregation",
            "code": "pair_context_out = einsum(attention, pair_context)",
            "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}",
            "inputs": [
              "values.attention_weights",
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_value_context"
            ]
          },
          {
            "id": "project_reduced_output",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
            "label": "Fuse scalar and pair contexts",
            "operation": "output_projection",
            "code": "attention_delta = output_projection(concat(scalar_context, pair_context_out))",
            "inputs": [
              "values.scalar_context",
              "values.pair_value_context"
            ],
            "outputs": [
              "values.attention_delta"
            ]
          },
          {
            "id": "residual_norm",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.residual_norm",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
            "label": "Residual, dropout, and norm",
            "operation": "residual_normalization",
            "code": "normalized_single = layer_norm(single_state + dropout(attention_delta))",
            "inputs": [
              "ports.single_state",
              "values.attention_delta"
            ],
            "outputs": [
              "values.normalized_single"
            ]
          },
          {
            "id": "transition_and_mask",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
            "instanceFactRef": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
            "label": "Transition and mask",
            "operation": "transition_mask",
            "code": "updated_single_state = transition(normalized_single) * attention_mask",
            "inputs": [
              "values.normalized_single",
              "ports.attention_mask"
            ],
            "outputs": [
              "ports.updated_single_state"
            ]
          }
        ]
      },
      {
        "id": "genie3_ipa_internals",
        "kind": "standard_block_instance",
        "title": "Genie 3 Invariant Point Attention Internals",
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
            "scale": "token",
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
            "rep_ref": "token_frames",
            "shape": "B x N x (3 x 3 + 3)",
            "scale": "token",
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
            "shape": "B x N token fields + B x A atom fields",
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
            "scale": "token",
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
              "relations.decoder_single_state_enters_ipa"
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
              "relations.decoder_single_state_enters_ipa"
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
              "representations.token_frames"
            ],
            "relation_path": [
              "relations.decoder_frames_condition_ipa"
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
              "representations.token_frames"
            ],
            "relation_path": [
              "relations.decoder_frames_condition_ipa"
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
              "relations.decoder_single_state_enters_ipa"
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
      },
      {
        "id": "task_featurization",
        "title": "Task Featurization",
        "summary": "Exactly one configured task source selects the unconditional, motif, or target path for a run. Unknown designed regions stay C-alpha tokens; Atom14 selectively expands known motif or target-interface residues before all paths converge on one model-ready feature batch.",
        "subject_ref": "modules.feature_builder",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 3,
          "column_sizing": "content",
          "row_sizing": "content",
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "value_design_request",
            "ref": "value_sites.design_request",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "module_task_source_router",
            "ref": "modules.task_source_router",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2,
            "role": "choose exactly one task path",
            "detail": "Based on the requested task, Genie 3 uses the corresponding featurization adapter: unconditional generation, motif scaffolding, or binder design."
          },
          {
            "id": "module_target_featurizer",
            "ref": "modules.target_featurizer",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 1,
            "board_ref": "binder_design_task_featurization",
            "role": "unknown binder plus known target",
            "detail": "Used when source is target. The binder begins as unknown C-alpha tokens, while the target supplies conditioned C-alpha structure. In Atom14 mode, selected target-interface residues additionally expand into side-chain heavy-atom tokens."
          },
          {
            "id": "module_motif_featurizer",
            "ref": "modules.motif_featurizer",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2,
            "board_ref": "motif_task_featurization",
            "role": "unknown scaffold plus known motif",
            "detail": "Used when source is motif. Scaffold residues remain unknown C-alpha tokens. Known motif residues carry sequence and coordinate conditioning; in Atom14 mode they expand into C-alpha plus available side-chain heavy-atom tokens."
          },
          {
            "id": "module_unconditional_featurizer",
            "ref": "modules.unconditional_featurizer",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "unconditional_task_featurization",
            "role": "length to unknown C-alpha slots",
            "detail": "Used when source is unconditional. Every requested residue becomes one active C-alpha token with unknown identity, placeholder conditioning coordinates, and sequence, structure, and interface masks disabled. Atom14 does not expand these unknown residues."
          },
          {
            "id": "module_feature_batch_assembler",
            "ref": "modules.feature_batch_assembler",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "role": "shared feature-batch interface",
            "detail": "Whichever task path was selected emits the same feature vocabulary. This stage pads token and atom axes, stacks samples, and prepares typed tensors for the sampler."
          },
          {
            "id": "value_feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "feature dictionary",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2,
            "role": "token and atom conditioning fields",
            "detail": "The batch contains token/atom identities, known values, and one-dimensional conditioning masks. Pairwise masks and pair features are derived later inside the pair embedder."
          }
        ],
        "parent": "design_overview",
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.design_request_enters_feature_builder"
            },
            "label": "source + constraints",
            "connection": {
              "title": "Generation specification",
              "role": "task selection input",
              "inside": "The source field chooses one feature path while its length, motif, or target metadata supplies that path's constraints."
            }
          },
          {
            "match": {
              "relation_ref": "relations.task_router_dispatches_unconditional_request"
            },
            "label": "source: unconditional",
            "connection": {
              "title": "Unconditional path",
              "role": "length-only request",
              "inside": "The router selects this path when the dataset source is unconditional and passes the requested length range."
            }
          },
          {
            "match": {
              "relation_ref": "relations.task_router_dispatches_motif_request"
            },
            "label": "source: motif",
            "connection": {
              "title": "Motif-scaffolding path",
              "role": "motif-constrained request",
              "inside": "The router selects this path for motif problem files containing scaffold ranges and one or more structural motif segments."
            }
          },
          {
            "match": {
              "relation_ref": "relations.task_router_dispatches_target_request"
            },
            "label": "source: target",
            "connection": {
              "title": "Binder-design path",
              "role": "target-constrained request",
              "inside": "The router selects this path for target problems that specify a binder length or framework plus target chains and interface annotations."
            }
          },
          {
            "match": {
              "relation_ref": "relations.unconditional_featurizer_produces_sample_features"
            },
            "label": "unknown C-alpha tokens",
            "connection": {
              "title": "Unconditional sample features",
              "role": "unconditioned token layout",
              "inside": "The featurizer creates one unknown C-alpha token per requested residue and leaves sequence, structure, and interface masks unset."
            }
          },
          {
            "match": {
              "relation_ref": "relations.motif_featurizer_produces_sample_features"
            },
            "label": "scaffold + motif features",
            "connection": {
              "title": "Motif-conditioned sample features",
              "role": "mixed generated and known regions",
              "inside": "Unknown scaffold residues stay C-alpha tokens while known motif residues carry sequence and coordinate masks and may be atomized."
            }
          },
          {
            "match": {
              "relation_ref": "relations.target_featurizer_produces_sample_features"
            },
            "label": "binder + target features",
            "connection": {
              "title": "Target-conditioned sample features",
              "role": "binder and target context",
              "inside": "Unknown binder tokens are concatenated with conditioned target-chain tokens, including the selected target-interface mask."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_builder_produces_feature_bundle"
            },
            "label": "pad + stack + type",
            "connection": {
              "title": "Model-ready feature batch",
              "role": "shared model interface",
              "inside": "The assembler pads token and atom fields to common lengths, stacks samples, and prepares the typed tensors consumed by sampling."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_87c341459930",
            "from": "module_feature_batch_assembler",
            "to": "value_feature_bundle",
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
              "label": "pad + stack + type",
              "connection": {
                "title": "Model-ready feature batch",
                "role": "shared model interface",
                "inside": "The assembler pads token and atom fields to common lengths, stacks samples, and prepares the typed tensors consumed by sampling."
              }
            }
          },
          {
            "id": "projection_99a624bbf428",
            "from": "module_motif_featurizer",
            "to": "module_feature_batch_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.motif_featurizer_produces_sample_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.motif_featurizer_produces_sample_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "scaffold + motif features",
              "connection": {
                "title": "Motif-conditioned sample features",
                "role": "mixed generated and known regions",
                "inside": "Unknown scaffold residues stay C-alpha tokens while known motif residues carry sequence and coordinate masks and may be atomized."
              }
            }
          },
          {
            "id": "projection_144b5f8496fb",
            "from": "module_target_featurizer",
            "to": "module_feature_batch_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.target_featurizer_produces_sample_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.target_featurizer_produces_sample_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "binder + target features",
              "connection": {
                "title": "Target-conditioned sample features",
                "role": "binder and target context",
                "inside": "Unknown binder tokens are concatenated with conditioned target-chain tokens, including the selected target-interface mask."
              }
            }
          },
          {
            "id": "projection_7a3cc88b526c",
            "from": "module_task_source_router",
            "to": "module_motif_featurizer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.task_router_dispatches_motif_request"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.task_router_dispatches_motif_request"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "source: motif",
              "connection": {
                "title": "Motif-scaffolding path",
                "role": "motif-constrained request",
                "inside": "The router selects this path for motif problem files containing scaffold ranges and one or more structural motif segments."
              }
            }
          },
          {
            "id": "projection_2a088d7923f2",
            "from": "module_task_source_router",
            "to": "module_target_featurizer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.task_router_dispatches_target_request"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.task_router_dispatches_target_request"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "source: target",
              "connection": {
                "title": "Binder-design path",
                "role": "target-constrained request",
                "inside": "The router selects this path for target problems that specify a binder length or framework plus target chains and interface annotations."
              }
            }
          },
          {
            "id": "projection_dd9634608563",
            "from": "module_task_source_router",
            "to": "module_unconditional_featurizer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.task_router_dispatches_unconditional_request"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.task_router_dispatches_unconditional_request"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "source: unconditional",
              "connection": {
                "title": "Unconditional path",
                "role": "length-only request",
                "inside": "The router selects this path when the dataset source is unconditional and passes the requested length range."
              }
            }
          },
          {
            "id": "projection_88cf9d4ab1a8",
            "from": "module_unconditional_featurizer",
            "to": "module_feature_batch_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.unconditional_featurizer_produces_sample_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.unconditional_featurizer_produces_sample_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "unknown C-alpha tokens",
              "connection": {
                "title": "Unconditional sample features",
                "role": "unconditioned token layout",
                "inside": "The featurizer creates one unknown C-alpha token per requested residue and leaves sequence, structure, and interface masks unset."
              }
            }
          },
          {
            "id": "projection_06cfac09bece",
            "from": "value_design_request",
            "to": "module_task_source_router",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.design_request_enters_feature_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.design_request_enters_feature_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "source + constraints",
              "connection": {
                "title": "Generation specification",
                "role": "task selection input",
                "inside": "The source field chooses one feature path while its length, motif, or target metadata supplies that path's constraints."
              }
            }
          }
        ],
        "classifications": {
          "modules.binder_target_feature_assembler": "collapsed:modules.target_featurizer",
          "modules.binder_tokens": "collapsed:modules.target_featurizer",
          "modules.feature_batch_assembler": "visible",
          "modules.motif_conditioned_tokens": "collapsed:modules.motif_featurizer",
          "modules.motif_feature_assembler": "collapsed:modules.motif_featurizer",
          "modules.motif_featurizer": "visible",
          "modules.motif_problem_parser": "collapsed:modules.motif_featurizer",
          "modules.motif_scaffold_tokens": "collapsed:modules.motif_featurizer",
          "modules.target_conditioned_tokens": "collapsed:modules.target_featurizer",
          "modules.target_featurizer": "visible",
          "modules.target_problem_parser": "collapsed:modules.target_featurizer",
          "modules.task_source_router": "visible",
          "modules.unconditional_featurizer": "visible",
          "modules.unconditional_frame_indices": "collapsed:modules.unconditional_featurizer",
          "modules.unconditional_placeholder_initializer": "collapsed:modules.unconditional_featurizer",
          "modules.unconditional_token_layout": "collapsed:modules.unconditional_featurizer",
          "value_sites.design_request": "visible",
          "value_sites.feature_bundle": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "unconditional_task_featurization",
        "title": "Unconditional Generation Task Featurization",
        "summary": "Illustrative example: a requested length of 100 becomes 100 active C-alpha coordinate slots with unknown residue identities and all conditioning masks disabled. Their shape is later used to initialize the Gaussian coordinate state.",
        "parent": "task_featurization",
        "subject_ref": "modules.unconditional_featurizer",
        "expansion_depth": 1,
        "grid": {
          "columns": 3,
          "rows": 1,
          "column_sizing": "content",
          "row_sizing": "content"
        },
        "nodes": [
          {
            "id": "module_unconditional_token_layout",
            "ref": "modules.unconditional_token_layout",
            "prominence": "primary",
            "treatment": "block",
            "col": 1,
            "row": 1
          },
          {
            "id": "module_unconditional_placeholder_initializer",
            "ref": "modules.unconditional_placeholder_initializer",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 1
          },
          {
            "id": "module_unconditional_frame_indices",
            "ref": "modules.unconditional_frame_indices",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 1
          }
        ],
        "exclude": [
          {
            "ref": "modules.task_source_router",
            "reason": "The parent task-featurization board owns selection of the unconditional task adapter."
          },
          {
            "ref": "modules.feature_batch_assembler",
            "reason": "The parent task-featurization board owns convergence into the shared batch assembler."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.unconditional_layout_initializes_unknown_features"
            },
            "label": "active C-alpha slots",
            "connection": {
              "title": "Unknown feature initialization",
              "role": "establish generated positions",
              "inside": "Each active token receives an unknown residue slot, a placeholder coordinate field, and disabled sequence, structure, and interface conditioning masks."
            }
          },
          {
            "match": {
              "relation_ref": "relations.unconditional_unknown_features_derive_frame_indices"
            },
            "label": "token + frame indices",
            "connection": {
              "title": "Frame-index metadata",
              "role": "prepare later frame construction",
              "inside": "Neighbor indices and validity masks describe where local frames can be reconstructed after noisy coordinates are available."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_d239593fa3c3",
            "from": "module_unconditional_placeholder_initializer",
            "to": "module_unconditional_frame_indices",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.unconditional_unknown_features_derive_frame_indices"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.unconditional_unknown_features_derive_frame_indices"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "token + frame indices",
              "connection": {
                "title": "Frame-index metadata",
                "role": "prepare later frame construction",
                "inside": "Neighbor indices and validity masks describe where local frames can be reconstructed after noisy coordinates are available."
              }
            }
          },
          {
            "id": "projection_949fc34e4d27",
            "from": "module_unconditional_token_layout",
            "to": "module_unconditional_placeholder_initializer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.unconditional_layout_initializes_unknown_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.unconditional_layout_initializes_unknown_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "active C-alpha slots",
              "connection": {
                "title": "Unknown feature initialization",
                "role": "establish generated positions",
                "inside": "Each active token receives an unknown residue slot, a placeholder coordinate field, and disabled sequence, structure, and interface conditioning masks."
              }
            }
          }
        ],
        "classifications": {
          "modules.feature_batch_assembler": "excluded",
          "modules.task_source_router": "excluded",
          "modules.unconditional_frame_indices": "visible",
          "modules.unconditional_placeholder_initializer": "visible",
          "modules.unconditional_token_layout": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "motif_task_featurization",
        "title": "Motif Scaffolding Task Featurization",
        "summary": "Illustrative example: 20 scaffold residues, motif segment A1, then 30 scaffold residues. The 50 designed residues remain unknown C-alpha tokens; A1 carries known sequence and coordinates and can selectively atomize in Atom14 mode.",
        "parent": "task_featurization",
        "subject_ref": "modules.motif_featurizer",
        "expansion_depth": 1,
        "grid": {
          "columns": 3,
          "rows": 2,
          "column_sizing": "content",
          "row_sizing": "content",
          "row_gap": 28
        },
        "reference_panels": [
          {
            "id": "authors_partial_atomization",
            "title": "Authors' partial-atomization diagram",
            "asset": "../../assets/reference-panels/genie3/figure_1_partial_atomization.png",
            "alt": "Author diagram titled Partial Atomization. Motif scaffolding places an atomized known motif between unknown C-alpha scaffold segments; binder design places an atomized target interface beside an unknown binder.",
            "caption": "Figure 1 shows the same task distinction as this board—known motif or target-interface residues may expose side-chain atoms, while designed regions remain unknown C-alpha tokens.",
            "source_ref": "genie3_2026",
            "locator": "Figure 1, Partial Atomization panel",
            "license_note": "Cropped from Lin et al. (2026), licensed CC BY 4.0.",
            "position": "right"
          }
        ],
        "nodes": [
          {
            "id": "module_motif_problem_parser",
            "ref": "modules.motif_problem_parser",
            "prominence": "primary",
            "treatment": "block",
            "col": 1,
            "row": 2
          },
          {
            "id": "module_motif_scaffold_tokens",
            "ref": "modules.motif_scaffold_tokens",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 1
          },
          {
            "id": "module_motif_conditioned_tokens",
            "ref": "modules.motif_conditioned_tokens",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "module_motif_feature_assembler",
            "ref": "modules.motif_feature_assembler",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.task_source_router",
            "reason": "The parent task-featurization board owns selection of the motif-scaffolding task adapter."
          },
          {
            "ref": "modules.feature_batch_assembler",
            "reason": "The parent task-featurization board owns convergence into the shared batch assembler."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.motif_parser_defines_scaffold_layout"
            },
            "label": "scaffold lengths",
            "connection": {
              "title": "Scaffold segments",
              "role": "regions to design",
              "inside": "Numeric layout segments specify how many unknown C-alpha residues appear before, between, or after the known motifs."
            }
          },
          {
            "match": {
              "relation_ref": "relations.motif_parser_selects_conditioned_segments"
            },
            "label": "known motif segments",
            "connection": {
              "title": "Motif segments",
              "role": "structural constraints",
              "inside": "Named motif segments select the residue identities and coordinates that remain available as conditioning context."
            }
          },
          {
            "match": {
              "relation_ref": "relations.motif_scaffold_tokens_enter_assembler"
            },
            "label": "unknown C-alpha tokens",
            "connection": {
              "title": "Generated scaffold features",
              "role": "unknown design regions",
              "inside": "Scaffold tokens carry their sequence positions but expose neither residue identity nor structural coordinates as conditioning."
            }
          },
          {
            "match": {
              "relation_ref": "relations.motif_conditioned_tokens_enter_assembler"
            },
            "label": "conditioned motif tokens",
            "connection": {
              "title": "Known motif features",
              "role": "sequence and structure context",
              "inside": "Motif tokens carry known identities and coordinates; Atom14 mode selectively adds available side-chain heavy-atom tokens."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_9a5015b24992",
            "from": "module_motif_conditioned_tokens",
            "to": "module_motif_feature_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.motif_conditioned_tokens_enter_assembler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.motif_conditioned_tokens_enter_assembler"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "conditioned motif tokens",
              "connection": {
                "title": "Known motif features",
                "role": "sequence and structure context",
                "inside": "Motif tokens carry known identities and coordinates; Atom14 mode selectively adds available side-chain heavy-atom tokens."
              }
            }
          },
          {
            "id": "projection_d84b034ac4e8",
            "from": "module_motif_problem_parser",
            "to": "module_motif_conditioned_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.motif_parser_selects_conditioned_segments"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.motif_parser_selects_conditioned_segments"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "known motif segments",
              "connection": {
                "title": "Motif segments",
                "role": "structural constraints",
                "inside": "Named motif segments select the residue identities and coordinates that remain available as conditioning context."
              }
            }
          },
          {
            "id": "projection_665470c20356",
            "from": "module_motif_problem_parser",
            "to": "module_motif_scaffold_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.motif_parser_defines_scaffold_layout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.motif_parser_defines_scaffold_layout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "scaffold lengths",
              "connection": {
                "title": "Scaffold segments",
                "role": "regions to design",
                "inside": "Numeric layout segments specify how many unknown C-alpha residues appear before, between, or after the known motifs."
              }
            }
          },
          {
            "id": "projection_9920b5a00944",
            "from": "module_motif_scaffold_tokens",
            "to": "module_motif_feature_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.motif_scaffold_tokens_enter_assembler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.motif_scaffold_tokens_enter_assembler"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "unknown C-alpha tokens",
              "connection": {
                "title": "Generated scaffold features",
                "role": "unknown design regions",
                "inside": "Scaffold tokens carry their sequence positions but expose neither residue identity nor structural coordinates as conditioning."
              }
            }
          }
        ],
        "classifications": {
          "modules.feature_batch_assembler": "excluded",
          "modules.motif_conditioned_tokens": "visible",
          "modules.motif_feature_assembler": "visible",
          "modules.motif_problem_parser": "visible",
          "modules.motif_scaffold_tokens": "visible",
          "modules.task_source_router": "excluded"
        },
        "projectionMode": "derived"
      },
      {
        "id": "binder_design_task_featurization",
        "title": "Binder Design Task Featurization",
        "summary": "Illustrative example: a 100-residue binder request plus a target PDB and interface list becomes 100 unknown binder C-alpha slots followed by conditioned target tokens; Atom14 selectively expands the marked target-interface residues.",
        "parent": "task_featurization",
        "subject_ref": "modules.target_featurizer",
        "expansion_depth": 1,
        "grid": {
          "columns": 3,
          "rows": 2,
          "column_sizing": "content",
          "row_sizing": "content",
          "row_gap": 28
        },
        "reference_panels": [
          {
            "id": "authors_partial_atomization",
            "title": "Authors' partial-atomization diagram",
            "asset": "../../assets/reference-panels/genie3/figure_1_partial_atomization.png",
            "alt": "Author diagram titled Partial Atomization. Motif scaffolding places an atomized known motif between unknown C-alpha scaffold segments; binder design places an atomized target interface beside an unknown binder.",
            "caption": "Figure 1 shows the same task distinction as this board—known motif or target-interface residues may expose side-chain atoms, while designed regions remain unknown C-alpha tokens.",
            "source_ref": "genie3_2026",
            "locator": "Figure 1, Partial Atomization panel",
            "license_note": "Cropped from Lin et al. (2026), licensed CC BY 4.0.",
            "position": "right"
          }
        ],
        "nodes": [
          {
            "id": "module_target_problem_parser",
            "ref": "modules.target_problem_parser",
            "prominence": "primary",
            "treatment": "block",
            "col": 1,
            "row": 2
          },
          {
            "id": "module_binder_tokens",
            "ref": "modules.binder_tokens",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 1
          },
          {
            "id": "module_target_conditioned_tokens",
            "ref": "modules.target_conditioned_tokens",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "module_binder_target_feature_assembler",
            "ref": "modules.binder_target_feature_assembler",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.task_source_router",
            "reason": "The parent task-featurization board owns selection of the binder-design task adapter."
          },
          {
            "ref": "modules.feature_batch_assembler",
            "reason": "The parent task-featurization board owns convergence into the shared batch assembler."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.target_parser_defines_binder_request"
            },
            "label": "binder specification",
            "connection": {
              "title": "Binder region",
              "role": "chain to design",
              "inside": "The problem supplies either a requested binder length or a binder framework from which the generated-chain features are built."
            }
          },
          {
            "match": {
              "relation_ref": "relations.target_parser_selects_target_interface"
            },
            "label": "target + interface",
            "connection": {
              "title": "Target context",
              "role": "structure to bind",
              "inside": "The target PDB supplies conditioned structure while the selected residue list marks the intended binding interface."
            }
          },
          {
            "match": {
              "relation_ref": "relations.binder_tokens_enter_target_assembler"
            },
            "label": "binder features",
            "connection": {
              "title": "Generated binder features",
              "role": "unknown chain",
              "inside": "A length-based binder contributes unknown C-alpha tokens; a supplied framework may contribute its own conditioned regions."
            }
          },
          {
            "match": {
              "relation_ref": "relations.target_tokens_enter_target_assembler"
            },
            "label": "conditioned target tokens",
            "connection": {
              "title": "Target feature context",
              "role": "fixed structural context",
              "inside": "Every target residue supplies conditioned C-alpha structure, and Atom14 selectively expands marked interface residues with side-chain atoms."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_13f6df403970",
            "from": "module_binder_tokens",
            "to": "module_binder_target_feature_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.binder_tokens_enter_target_assembler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.binder_tokens_enter_target_assembler"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "binder features",
              "connection": {
                "title": "Generated binder features",
                "role": "unknown chain",
                "inside": "A length-based binder contributes unknown C-alpha tokens; a supplied framework may contribute its own conditioned regions."
              }
            }
          },
          {
            "id": "projection_3ed13a7c100c",
            "from": "module_target_conditioned_tokens",
            "to": "module_binder_target_feature_assembler",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.target_tokens_enter_target_assembler"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.target_tokens_enter_target_assembler"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.sample_feature_dictionary"
            ],
            "presentation": {
              "label": "conditioned target tokens",
              "connection": {
                "title": "Target feature context",
                "role": "fixed structural context",
                "inside": "Every target residue supplies conditioned C-alpha structure, and Atom14 selectively expands marked interface residues with side-chain atoms."
              }
            }
          },
          {
            "id": "projection_647615a79bd6",
            "from": "module_target_problem_parser",
            "to": "module_binder_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.target_parser_defines_binder_request"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.target_parser_defines_binder_request"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "binder specification",
              "connection": {
                "title": "Binder region",
                "role": "chain to design",
                "inside": "The problem supplies either a requested binder length or a binder framework from which the generated-chain features are built."
              }
            }
          },
          {
            "id": "projection_453d65ce8a72",
            "from": "module_target_problem_parser",
            "to": "module_target_conditioned_tokens",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.target_parser_selects_target_interface"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.target_parser_selects_target_interface"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.design_request"
            ],
            "presentation": {
              "label": "target + interface",
              "connection": {
                "title": "Target context",
                "role": "structure to bind",
                "inside": "The target PDB supplies conditioned structure while the selected residue list marks the intended binding interface."
              }
            }
          }
        ],
        "classifications": {
          "modules.binder_target_feature_assembler": "visible",
          "modules.binder_tokens": "visible",
          "modules.feature_batch_assembler": "excluded",
          "modules.target_conditioned_tokens": "visible",
          "modules.target_problem_parser": "visible",
          "modules.task_source_router": "excluded"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
